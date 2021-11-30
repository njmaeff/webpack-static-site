import path from "path";

export function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

export const getPathFromUrl = (href: string) => {
    let ref = href ?? "";
    if (!isValidHttpUrl(ref)) {
        const assetDir = path.dirname(SC_STATIC_ASSET_PATH);
        const resolved = path.resolve(assetDir, ref);
        ref = path.relative(assetDir, resolved);
    }
    return ref;
};
