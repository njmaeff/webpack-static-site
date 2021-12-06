import React from "react";
import {Page} from "./pageTemplate";
import {css} from "@emotion/react";
import {PHPTemplate} from "@njmaeff/webpack-static-site/components/types";

export const PageTemplate: PHPTemplate<{ main, heading }> = ({
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

PageTemplate.props = {
    heading: '',
    main: ''
}

PageTemplate.includeDocType = true;