/**
 * This loader will add the @charset "UTF-8"; to the beginning of the css file.
 *
 */
import webpack from "webpack";

export const loader: webpack.LoaderDefinitionFunction = (src: string) => {
    if (!src.startsWith('@charset "UTF-8";')) {
        return `@charset "UTF-8";\n\n${src}`;
    } else {
        return src;
    }
};

export default loader;
