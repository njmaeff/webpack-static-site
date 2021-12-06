import React from "react";
import {renderHeadStatic} from "./head";
import createEmotionServer from '@emotion/server/create-instance'
import {
    cache,
    renderToStaticMarkupEmotion
} from "./render-static-markup-emotion";
import {PHPProps, PHPTemplate} from "./types"
import snakeCase from "lodash/snakeCase";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";

export const toPascalCase = (str) => {
    return startCase(camelCase(str)).replace(/ /g, '');
};

export const makePHPDataClass = (name: string, props) => {
    let phpConstructorProps = []
    let phpProps = [];
    let phpAssignments = [];

    for (const [key, value] of Object.entries(props)) {

        let type;
        switch (typeof value) {
            case "boolean":
                type = 'bool'
                break;
            case "number":
                type = 'int'
                break;
            case "string":
                type = 'string'
                break;
        }

        phpConstructorProps.push(
            `       ${type} $${key} = ${JSON.stringify(value)}`
        )
        phpProps.push(
            `   public ${type} $${key};`
        )

        phpAssignments.push(
            `      $this->${key} = $${key};`
        )

    }
    return [
        `class ${toPascalCase(name)}Data {`,
        ...phpProps,
        `   public function __construct(`,
        `${phpConstructorProps.join(',\n')}`,
        `   )`,
        `   {`,
        ...phpAssignments,
        `   }`,
        `}\n`
    ]
};

export const makeDestructureProps = (props: PHPProps) => {
    return [
        `[`,
        `${
            Object.keys(props).map((key) => `       '${key}' => $${key}`).join(',\n')
        }`,
        `   ]`
    ].join('\n')

};

export const makePHPFunctionWrapper = (name: string, props: PHPProps, template: string) => {

    return [
        `function ${snakeCase(name)} (${toPascalCase(name)}Data $data): string`,
        `{`,
        `   ${makeDestructureProps(props)} = get_object_vars($data);\n`,
        `   return <<<"EOL"`,
        `${template}`,
        `EOL;`,
        `}`
    ]
};

export const renderStaticPHP = (templates: { [key: string]: PHPTemplate }) => {
    const {
        extractCriticalToChunks,
        constructStyleTagsFromChunks
    } = createEmotionServer(cache)

    const phpFile = [
        `<?php`,
        // `namespace ${SC_STATIC_ASSET_PATH.replace(/\//g, '\\')};`
    ]

    for (const [name, Component] of Object.entries(templates)) {
        phpFile.push(
            ...makePHPDataClass(name, Component.props)
        )

        let props = {}
        for (const key of Object.keys(Component.props)) {
            props[key] = `$${key}`
        }
        const html = renderToStaticMarkupEmotion(
            () => <Component {...props}/>
        )
        const chunks = extractCriticalToChunks(html)
        const styles = constructStyleTagsFromChunks(chunks)

        let template: string
        if (Component.includeDocType) {
            const {head, bodyAttrs, htmlAttrs} = renderHeadStatic();
            template = `
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
    `
        } else {
            template = [
                styles,
                html,
            ].join('\n')
        }

        phpFile.push(
            ...makePHPFunctionWrapper(name, props, SC_FORMAT(template))
        )
    }
    return phpFile.join('\n')
};

export default renderStaticPHP
