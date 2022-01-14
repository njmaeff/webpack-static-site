import React from "react";
import {renderHeadStatic} from "./head";
import createEmotionServer from '@emotion/server/create-instance'
import {
    cache,
    renderToStaticMarkupEmotion
} from "./render-static-markup-emotion";
import {PHPMeta, PHPTemplate} from "./types"
import snakeCase from "lodash/snakeCase";
import camelCase from "lodash/camelCase";
import startCase from "lodash/startCase";
import path from "path";

export const toPascalCase = (str) => {
    return startCase(camelCase(str)).replace(/ /g, '');
};


export const makeComponentProps = (obj) => {
    let props = {}
    for (const key of Object.keys(obj)) {
        props[key] = `$${key}`
    }

    return props;
};

export const makePHPFunctionProps = (obj) => {
    let phpFunctionProps = []
    for (const [key, value] of Object.entries(obj)) {

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

        phpFunctionProps.push(
            `       ${type} $${key} = ${JSON.stringify(value)}`
        )

    }

    return phpFunctionProps.join(',\n')
};

export const makePHPStaticFunctionWrapper = (name: string, params: string, template: string) => {

    return [
        `   public static function ${snakeCase(name)} (`,
        `${params}`,
        `   ): string`,
        `   {\n`,
        `      return <<<"EOL"`,
        `${template}`,
        `EOL;`,
        `   }`
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
    const asset = path.parse(SC_STATIC_ASSET_PATH);

    const [_, ...dirs] = asset.dir.split(path.sep);
    let namespace = [SC_PHP_NAMESPACE, ...dirs].map((name) => toPascalCase(name)).join('\\');
    let moduleName = toPascalCase(asset.name)

    const phpFile = [
        `<?php\n`,
        ...(namespace ? [`namespace ${namespace};\n`] : []),
        `class ${moduleName}`,
        `{`,
    ]

    for (const [name, Component] of Object.entries(templates) as [string, PHPTemplate][]) {

        const props = Component.props ?? meta.props ?? {};
        const html = renderToStaticMarkupEmotion(
            () => {
                return <Component {...makeComponentProps(props)}/>;
            }
        );
        const chunks = extractCriticalToChunks(html)
        const styles = constructStyleTagsFromChunks(chunks)

        let template: string
        if (Component.includeDocType ?? meta.includeDocType) {
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
            ...makePHPStaticFunctionWrapper(name, makePHPFunctionProps(props), SC_FORMAT(template))
        )
    }
    phpFile.push(
        `}`
    )
    return phpFile.join('\n')
};

export default renderStaticPHP
