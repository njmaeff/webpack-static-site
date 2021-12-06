import React from "react";
import {renderHeadStatic} from "./head";
import createEmotionServer from '@emotion/server/create-instance'
import {
    cache,
    renderToStaticMarkupEmotion
} from "./render-static-markup-emotion";

export const renderStaticEmotion = (Component) => {
    const {
        extractCriticalToChunks,
        constructStyleTagsFromChunks
    } = createEmotionServer(cache)

    const html = renderToStaticMarkupEmotion(
        Component
    )
    const chunks = extractCriticalToChunks(html)
    const styles = constructStyleTagsFromChunks(chunks)

    const {head, bodyAttrs, htmlAttrs} = renderHeadStatic();

    return SC_FORMAT(`
    <!DOCTYPE html>
    <html ${htmlAttrs}>
        <head>
            ${head}
            ${styles}
        </head>
        <body ${bodyAttrs}>
          ${html}
        </body>
    </html>
`);
};
