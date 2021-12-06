import {renderToStaticMarkup} from "react-dom/server";
import {CacheProvider} from "@emotion/react";
import React from "react";
import createCache from "@emotion/cache";

const key = 'css'
export const cache = createCache({key})
export const renderToStaticMarkupEmotion = (Component) => {
    return renderToStaticMarkup(
        <CacheProvider value={cache}>
            <Component/>
        </CacheProvider>
    )
};
