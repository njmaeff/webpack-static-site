/**
 * This is a clone of the "file-loader" module. I needed some extra
 * functionality verses the new webpack 5 asset modules.
 */
import path from "path";

import {getOptions, interpolateName} from "loader-utils";
import {validate} from "schema-utils";

import schema from "./options.json";
import {normalizePath} from "./utils";

export const fileLoader = function (content, options) {
    const context = options.context || this.rootContext;
    const name = options.name || "[contenthash].[ext]";

    const url = interpolateName(this, name, {
        context,
        content,
        regExp: options.regExp,
    });

    let outputPath = url;

    if (options.outputPath) {
        if (typeof options.outputPath === "function") {
            outputPath = options.outputPath(url, this.resourcePath, context);
        } else {
            outputPath = path.posix.join(options.outputPath, url);
        }
    }

    let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

    if (options.publicPath) {
        if (typeof options.publicPath === "function") {
            publicPath = options.publicPath(url, this.resourcePath, context);
        } else {
            publicPath = `${
                options.publicPath.endsWith("/")
                    ? options.publicPath
                    : `${options.publicPath}/`
            }${url}`;
        }

        publicPath = JSON.stringify(publicPath);
    }

    if (options.postTransformPublicPath) {
        publicPath = options.postTransformPublicPath(publicPath);
    }

    if (typeof options.emitFile === "undefined" || options.emitFile) {
        const assetInfo: {
            sourceFilename?: string;
            immutable?: boolean;
            minimized?: boolean;
        } = {minimized: options.noMinimize ?? false};

        if (typeof name === "string") {
            let normalizedName = name;

            const idx = normalizedName.indexOf("?");

            if (idx >= 0) {
                normalizedName = normalizedName.substr(0, idx);
            }

            const isImmutable =
                /\[([^:\]]+:)?(hash|contenthash)(:[^\]]+)?]/gi.test(
                    normalizedName
                );

            if (isImmutable === true) {
                assetInfo.immutable = true;
            }
        }

        assetInfo.sourceFilename = normalizePath(
            path.relative(this.rootContext, this.resourcePath)
        );

        this.emitFile(outputPath, content, null, assetInfo);
    }

    return publicPath;
};

export const raw = true;

export default function (content) {
    const options: any = getOptions(this);

    validate(schema as any, options, {
        name: "File Loader",
        baseDataPath: "options",
    });
    const publicPath = fileLoader.call(this, content, options);

    const esModule =
        typeof options.esModule !== "undefined" ? options.esModule : true;

    return `${esModule ? "export default" : "module.exports ="} ${publicPath};`;
}
