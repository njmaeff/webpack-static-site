import React from "react";
import {Page} from "../pageTemplate";
import {css} from "@emotion/react";
import {PHPMeta,} from "@njmaeff/webpack-static-site/components/types";

type PageProps = {
    main;
    heading;
}

export const PageTemplate: React.FC<PageProps> = ({
                                                      main,
                                                      heading
                                                  }) => {
    return <Page heading={'Docs | Index'}>
        <h1 css={
            css`
                font-size: 2.5rem;
            `
        }>{heading}</h1>

        <div>

            <h2 css={
                css`
                    font-size: 3rem;
                `
            }>
                Hello
            </h2>
        </div>
        {main}
    </Page>
};
export default {
    props: {
        heading: '',
        main: ''
    },
    includeDocType: true,
    namespaceBase: [`NJmaeff`,]
} as PHPMeta<PageProps>
