import React from "react";
import {renderHeadStatic} from "./head";
import createEmotionServer from '@emotion/server/create-instance'
import {
    cache,
    renderToStaticMarkupEmotion
} from "./render-static-markup-emotion";
import {PHPMeta, PHPProps} from "./types"
import snakeCase from "lodash/snakeCase";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";
import path from "path";

export const toPascalCase = (str) => {
    return startCase(camelCase(str)).replace(/ /g, '');
};

export const makePHPDataClass = (name: string, props, dataClassName: string) => {
    let phpConstructorProps = []

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
            `       public ${type} $${key} = ${JSON.stringify(value)}`
        )

    }
    return [
        `class ${dataClassName}`,
        `{`,
        `   public function __construct(`,
        `${phpConstructorProps.join(',\n')}`,
        `   )`,
        `   {`,
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

export const makePHPFunctionWrapper = (name: string, props: PHPProps, template: string, dataName: string) => {

    return [
        `function ${snakeCase(name)} (${dataName} $data): string`,
        `{`,
        `   ${makeDestructureProps(props)} = get_object_vars($data);\n`,
        `   return <<<"EOL"`,
        `${template}`,
        `EOL;`,
        `}`
    ]
};

export const renderStaticPHP = ({
                                    default: meta,
                                    ...templates
                                }: { default: PHPMeta }) => {
    const {
        extractCriticalToChunks,
        constructStyleTagsFromChunks
    } = createEmotionServer(cache)
    let [moduleName] = meta.namespaceBase?.slice(-1)

    if (moduleName) {
        moduleName = toPascalCase(moduleName);
    } else {
        moduleName = 'DataClass'
    }

    const namespace = [meta.namespaceBase?.join('\\'), path.parse(SC_STATIC_ASSET_PATH).name].join('\\');
    const phpFile = [
        `<?php\n`,
        ...(namespace ? [`namespace ${namespace};\n`] : [])
    ]
    phpFile.push(
        ...makePHPDataClass(moduleName, meta.props, moduleName)
    )

    let props = {}
    for (const key of Object.keys(meta.props)) {
        props[key] = `$${key}`
    }

    for (const [name, Component] of Object.entries(templates) as [string, React.FC][]) {

        const html = renderToStaticMarkupEmotion(
            () => <Component {...props}/>
        );
        const chunks = extractCriticalToChunks(html)
        const styles = constructStyleTagsFromChunks(chunks)

        let template: string
        if (meta.includeDocType) {
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
            ...makePHPFunctionWrapper(name, props, SC_FORMAT(template), moduleName)
        )
    }
    return phpFile.join('\n')
};

export default renderStaticPHP
