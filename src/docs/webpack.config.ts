import {makeConfig} from "@njmaeff/webpack-static-site/make-config";
import path from "path";

export default makeConfig(({webpack}) => {

    // generate the templated webpack config. You may modify the config at this
    // point or return it directly
    return webpack({
        root: path.join(__dirname, "pages"), // default
        outputPath: path.join(__dirname, "dist"), // default
        formatter: "js-minify", // default
        pageExtension: ".page.tsx", // default but jsx supported too
        emotionJS: true, // default is false but you can use emotion.js in your code if enabled
        // see webpack copy plugin for full usage
        // https://webpack.js.org/plugins/copy-webpack-plugin/
        copy: {
            patterns: [
                {
                    from: "assets",
                    to: "assets",
                    noErrorOnMissing: true,
                },
                {
                    from: "js/*.js",
                    to: "js/[name][ext]",
                    noErrorOnMissing: true,
                    info: {
                        minimized: true,
                    },
                },
            ],
        },
    });
});

