import path from "path";
import globby from "globby";

export const getFilesFromGlob = (context: string, glob: string[]) => {
    const paths = glob.map((pattern) => path.join(context, pattern));
    return globby.sync(paths);
};

export const getRelativeFiles = (context: string, glob: string[]) => {
    return getFilesFromGlob(context, glob).map((file) =>
        path.relative(context, file)
    );
};
