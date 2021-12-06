debugger
import {renderToStaticMarkup} from "react-dom/server";
import {renderHeadStatic} from "./head";
import React from "react";
import {CacheProvider} from '@emotion/react'
import createEmotionServer from '@emotion/server/create-instance'
import createCache from '@emotion/cache'

export const renderStaticEmotion = (Component) => {
    const key = 'static-css'
    const cache = createCache({key})
    const {
        extractCriticalToChunks,
        constructStyleTagsFromChunks
    } = createEmotionServer(cache)

    const html = renderToStaticMarkup(
        <CacheProvider value={cache}>
            <Component/>
        </CacheProvider>
    )

    const chunks = extractCriticalToChunks(html)
    const styles = constructStyleTagsFromChunks(chunks)

    const {head, bodyAttrs, htmlAttrs} = renderHeadStatic();

    return `
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
`;
};
