import {renderToStaticMarkup} from "react-dom/server";
import {renderHeadStatic} from "./head";
import React from "react";

export const renderStatic = (Component) => {
    const doc = renderToStaticMarkup(<Component/>);
    const {head, bodyAttrs, htmlAttrs} = renderHeadStatic();

    return `
    <!DOCTYPE html>
    <html ${htmlAttrs}>
        <head>
            ${head}
        </head>
        <body ${bodyAttrs}>
          ${doc}
        </body>
    </html>
`;
};
