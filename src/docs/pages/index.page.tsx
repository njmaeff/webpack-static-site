import React from "react";
import {Page} from "./pageTemplate";
import Readme from "../readme.md"
import {Comment} from "../../webpack-static-site/components/comment";
import {Head} from "@njmaeff/webpack-static-site/components/head";
import {css} from "@njmaeff/webpack-static-site/util/css";

export default () => {

    return <Page title={'Docs | Index'}>
        {/*add extra tags to the head*/}
        <Head>
            <style>
                {/*special function we can use that helps us create embedded styles*/}
                {css`
                    h1 {
                        font-size: 2.5rem
                    }
                `}
            </style>
        </Head>

        <a href={'page2.html'}>Go to page two</a>
        <Comment>Create an HTML Comment</Comment>

        {/*using markdown or mdx*/}
        <Readme/>
    </Page>
};
