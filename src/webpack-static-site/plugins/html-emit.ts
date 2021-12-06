import webpack from "webpack";
import * as path from "path";
import {html as beautify_html} from "js-beautify";
import VirtualModulesPlugin from "webpack-virtual-modules";
import {getRelativeFiles} from "../util/file";
import {Formatter} from "./types";
import {NodeVM} from "vm2";

const PLUGIN_NAME = "html-emit-plugin";

export class HTMLEmitPlugin {
    apply: webpack.WebpackPluginFunction = (compiler) => {
        const virtualModules = new VirtualModulesPlugin();
        virtualModules.apply(compiler);

        compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
            const context = compiler.options.context;
            const pageExtension = this.options.pageExtension;
            const relativeEntryFiles = getRelativeFiles(
                context,
                [`**/*${pageExtension}`]
            );
            const entries = {};
            for (const file of relativeEntryFiles) {

                const entry = path.parse(file)
                const nameWithoutExtension = entry.base.replace(pageExtension, "");
                const name = `virtual_page-${entry.base}`;
                const fileName = `./${path.join(path.dirname(file), name)}`;

                // create runtime module
                virtualModules.writeModule(
                    fileName,
                    this.options.emotionJS ? createStaticModuleWithEmotion({file: entry.base}) : createStaticModule({file: entry.base})
                );
                entries[path.join(entry.dir, nameWithoutExtension)] = {
                    import: [fileName],
                };
            }

            Object.assign(compiler.options.entry, entries);
            this.entries = entries;

        });

        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tapAsync(
                PLUGIN_NAME,
                async (assets, cb) => {
                    for (const name of Object.keys(this.entries)) {
                        const entry = name + ".js";
                        const asset = assets[entry];

                        // so we don't emit the react javascript file
                        delete assets[entry];

                        const chunk = compilation.namedChunks.get(name);
                        const currentHash = chunk.renderedHash;
                        const lastHash = this.hashes.get(entry) ?? "";

                        // skip rending the source if the hashes match
                        if (lastHash === currentHash) {
                            continue;
                        }

                        // transform and emit the asset
                        this.hashes.set(entry, currentHash);
                        const src = asset.source() as string;
                        try {
                            const result = await this.transformAsset(
                                src,
                                path.join(
                                    compilation.options.output
                                        .publicPath as string,
                                    entry
                                ),
                            );
                            compilation.emitAsset(
                                name + ".html",
                                new webpack.sources.RawSource(result)
                            );
                        } catch (e) {
                            compilation.errors.push(e);
                        }
                    }
                    cb();
                }
            );
        });
    };

    private formatBeautify(src: string) {
        return beautify_html(src, {
            wrap_line_length: 80,
            inline: ["a", "li", "strong", "img", "abbr"],
            extra_liners: [
                "li",
                "p",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "header",
                "main",
                "footer",
                "nav",
                "article",
                "aside",
                "section",
            ],
            wrap_attributes: "auto",
        });
    }

    private async formatPrettier(src: string) {
        const prettier = await import("prettier");
        const options =
            this.prettierConfig ??
            (await prettier.resolveConfig(process.cwd()));
        const formattedHTML = prettier.format(src, {
            ...options,
            parser: "html",
        });
        this.prettierConfig = options;
        return formattedHTML;
    }

    private async transformAsset(
        src: string,
        assetPath: string,
    ) {
        let rawHtml = renderStaticPage(src, assetPath);

        // special replacement so we can add comments in our html using the
        // special react Comment component
        const html = rawHtml
            .replace(/<sc-react-comment>/g, "")
            .replace(/<\/sc-react-comment>/g, "");

        if (this.options.formatter === "js-minify") {
            return this.formatBeautify(html);
        } else {
            return this.formatPrettier(html);
        }
    }

    constructor(
        private options: {
            pageExtension: string,
            useStaticTransform: boolean;
            formatter: Formatter;
            emotionJS: boolean
        }
    ) {
    }

    private prettierConfig: any;
    private hashes = new Map<string, string>();
    private entries: { [key: string]: string };
}

/**
 * This is how we transform the react code into static html. We provide a
 * global variable SC_STATIC_ASSET_PATH so our special Link component can use
 * the correct relative path for sass styles.
 * @param src
 * @param assetPath
 */
export const renderStaticPage = (src: string, assetPath: string) => {
    let mod = {
        exports: {default: ""},
    };
    const vm = new NodeVM({
        require: {
            external: true,
            builtin: ["*"]
        },
        sandbox: {
            // require,
            module: mod,
            exports: mod.exports,
            SC_STATIC_ASSET_PATH: assetPath,
            // process,
        }
    });

    vm.run(src, assetPath)

    // vm.runInContext(
    //     src,
    //     vm.createContext({
    //         require,
    //         module: mod,
    //         exports: mod.exports,
    //         SC_STATIC_ASSET_PATH: assetPath,
    //         process,
    //     })
    // );

    return mod.exports.default;
};

/**
 * Using the webpack virtual module plugin, we can import our runtime code and
 * transform the targeted react file to static html
 * @param file
 */
export const createStaticModule = ({file}) => {
    const fileName = JSON.stringify(`./${file}`);
    return [
        `import {default as App} from ${fileName};`,
        `export default require("@njmaeff/webpack-static-site/components/render-static").renderStatic(App);`,
    ].join("\n");
};

export const createStaticModuleWithEmotion = ({file}) => {
    const fileName = JSON.stringify(`./${file}`);
    return [
        `import {default as App} from ${fileName};`,
        `export default require("@njmaeff/webpack-static-site/components/render-static-emotion").renderStaticEmotion(App);`,
    ].join("\n");
};
