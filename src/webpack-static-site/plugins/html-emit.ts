import webpack from "webpack";
import * as path from "path";
import {html as beautify_html} from "js-beautify";
import VirtualModulesPlugin from "webpack-virtual-modules";
import {getRelativeFiles} from "../util/file";
import {NodeVM} from "vm2";
import {Formatter} from "./types";
import prettier from "prettier";

const PLUGIN_NAME = "html-emit-plugin";

export class HTMLEmitPlugin {
    apply: webpack.WebpackPluginFunction = (compiler) => {
        const virtualModules = new VirtualModulesPlugin();
        virtualModules.apply(compiler);

        compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => {
            const pages = this.createEntryFromFiles(virtualModules, compiler.options.context, this.options.pageExtension, this.options.emotionJS
                ? createStaticModuleWithEmotion
                : createStaticModule
            )
            const phpPages = this.createEntryFromFiles(virtualModules, compiler.options.context, this.options.phpExtension, createStaticPHPModuleWithEmotion)

            const entries = {...pages, ...phpPages}
            Object.assign(compiler.options.entry, entries);
            this.entries = entries;

        });

        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            compilation.hooks.processAssets.tapAsync(
                PLUGIN_NAME,
                async (assets, cb) => {
                    this.prettierConfig = await prettier.resolveConfig(process.cwd());

                    for (const [name, entry] of Object.entries(this.entries)) {
                        const entryFile = name + ".js";
                        const asset = assets[entryFile];

                        // so we don't emit the react javascript file
                        delete assets[entryFile];

                        const chunk = compilation.namedChunks.get(name);
                        const currentHash = chunk.renderedHash;
                        const lastHash = this.hashes.get(entryFile) ?? "";

                        // skip rending the source if the hashes match
                        if (lastHash === currentHash) {
                            continue;
                        }

                        // transform and emit the asset
                        this.hashes.set(entryFile, currentHash);
                        const src = asset.source() as string;
                        try {
                            const result = await this.transformAsset(
                                src,
                                path.join(
                                    compilation.options.output
                                        .publicPath as string,
                                    entryFile
                                ),
                            );
                            compilation.emitAsset(
                                name + entry._sc_extension,
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

    private createEntryFromFiles(virtualModules, context, pageExtension, runtime) {
        const files = getRelativeFiles(
            context,
            [`**/*${pageExtension}`]
        );
        const entries = {};
        for (const file of files) {

            const entry = path.parse(file)
            const nameWithoutExtension = entry.base.replace(pageExtension, "");
            const name = `virtual_page-${entry.base}`;
            const fileName = `./${path.join(path.dirname(file), name)}`;

            // create runtime module
            virtualModules.writeModule(
                fileName,
                runtime({file: entry.base})
            );

            entries[path.join(entry.dir, nameWithoutExtension)] = {
                _sc_extension: pageExtension === this.options.pageExtension ? '.html' : '.php',
                import: [fileName],
            };
        }

        return entries;

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

    private formatPrettier(src: string, {
        parser = 'html',
        plugins = []
    } = {}) {

        const options = this.prettierConfig;
        const formattedHTML = prettier.format(src, {
            ...options,
            plugins: [...plugins, ...(options.plugins ?? [])],
            parser,
        });
        this.prettierConfig = options;
        return formattedHTML;
    }

    private async transformAsset(
        src: string,
        assetPath: string,
    ) {
        return this.renderStaticPage(src, assetPath);
    }

    /**
     * This is how we transform the react code into static html. We provide a
     * global variable SC_STATIC_ASSET_PATH so our special Link component can
     * use the correct relative path for sass styles.
     * @param src
     * @param assetPath
     */
    private renderStaticPage(src: string, assetPath: string) {


        // special replacement so we can add comments in our html using the
        // special react Comment component
        const formatter = (src) => {
            let html = src
                .replace(/<sc-react-comment>/g, "")
                .replace(/<\/sc-react-comment>/g, "");

            if (this.options.formatter === "js-minify") {
                return this.formatBeautify(html);
            } else {
                return this.formatPrettier(html);
            }
        }

        const vm = new NodeVM({
            require: {
                external: true,
                builtin: ["path", "stream", "buffer", "events"],
                mock: {
                    events: require("events"),
                }
            },
            sandbox: {
                SC_STATIC_ASSET_PATH: assetPath,
                SC_FORMAT: (src) => formatter(src),
                SC_PHP_NAMESPACE: this.options.phpNamespace,
            },
        });
        return vm.run(src, assetPath)
    };

    constructor(
        private options: {
            pageExtension: string,
            phpExtension: string,
            phpNamespace: string,
            useStaticTransform: boolean;
            emotionJS: boolean;
            formatter: Formatter;
        }
    ) {
    }

    private prettierConfig: any;
    private hashes = new Map<string, string>();
    private entries: { [key: string]: { import: string, _sc_extension: '.php' | '.html' } };
}


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

export const createStaticPHPModuleWithEmotion = ({file}) => {
    const fileName = JSON.stringify(`./${file}`);
    return [
        `import * as App from ${fileName};`,
        `export default require("@njmaeff/webpack-static-site/components/render-static-php").default(App);`,
    ].join("\n");
};
