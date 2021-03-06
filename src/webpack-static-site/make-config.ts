import webpack, {Configuration} from "webpack";
import path from "path";
import {HTMLEmitPlugin} from "./plugins/html-emit";
import CopyPlugin, {CopyPluginOptions} from "copy-webpack-plugin";
import {Formatter} from "./plugins/types";

export const resolve = (src: string) =>
    require.resolve(src, {paths: [__dirname]});

export interface DefaultConfigTemplateParams {
    outputPath?: string;
    root?: string;
    copy?: CopyPluginOptions;
    formatter?: Formatter;
    pageExtension?: string,
}

const defaultConfigTemplate = ({
                                   root = path.join(process.cwd(), "pages"),
                                   outputPath = path.join(process.cwd(), "dist"),
                                   copy,
                                   formatter = "js-minify",
                                   pageExtension = '.page.tsx',
                               }: DefaultConfigTemplateParams = {}) =>
    ({
        entry: {},
        context: root,
        mode: "production",
        target: "node",
        node: {
            __dirname: true,
        },
        output: {
            path: outputPath,
            assetModuleFilename: `[path][name][ext]`,
            publicPath: "/",
            libraryTarget: "commonjs2",
            libraryExport: "default"
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
        module: {
            rules: [
                {
                    test: /\.(tsx|jsx|js|ts)?$/,
                    use: [
                        {
                            loader: resolve("babel-loader"),
                            options: {
                                presets: [
                                    resolve("@babel/preset-env"),
                                    resolve("@babel/preset-react"),
                                    resolve("@babel/preset-typescript"),
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.(mdx|md)?$/,
                    use: [
                        {
                            loader: resolve("babel-loader"),
                            options: {
                                presets: [
                                    resolve("@babel/preset-env"),
                                    resolve("@babel/preset-react"),
                                ],
                            },
                        },
                        resolve("@mdx-js/loader"),
                    ],
                },
                {
                    test: /\.(s[ac]ss|css)$/i,
                    use: [
                        {
                            loader: resolve("./loader/file"),
                            options: {
                                name: `[path][name].css`,
                            },
                        },
                        {
                            loader: resolve("postcss-loader"),
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        resolve("postcss-preset-env"),
                                        resolve("autoprefixer"),
                                    ],
                                },
                            },
                        },
                        resolve("./loader/charset"),
                        // Compiles Sass to CSS
                        {
                            loader: resolve("sass-loader"),
                            options: {
                                sassOptions: {
                                    charset: false,
                                    outputStyle: "expanded",
                                },
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    exclude: /\.template\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource",
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: "asset/resource",
                },
                {
                    test: /\.(pdf)$/i,
                    type: "asset/resource",
                },
            ],
        },
        plugins: [
            new HTMLEmitPlugin({
                pageExtension,
                formatter,
                useStaticTransform: true,
            }),
            new CopyPlugin({
                patterns: [
                    ...(copy?.patterns ?? []),
                ],
                options: copy?.options,
            }) as any,
        ],
    } as Configuration);

export const makeConfig = (
    fn: (opts: {
        webpack: typeof defaultConfigTemplate;
    }) => webpack.Configuration
) => {
    return fn({webpack: defaultConfigTemplate});
};
