import React from "react";
import {WithMdx} from "@njmaeff/webpack-static-site/components/mdx";
import {Head} from "@njmaeff/webpack-static-site/components/head";
import {Link} from "../../webpack-static-site/components/link";
import Styles from "./styles.scss"

export interface PageProps {
    heading: string;
    charSet?: string;
    lang?: string;
}

export const Page: React.FC<PageProps> = ({
                                              children,
                                              charSet = "UTF-8",
                                              lang = "en",
                                              ...props
                                          }) => {


    return (
        // wrapper of the MDXProvider https://mdxjs.com/docs/using-mdx/#mdx-provider.
        <WithMdx>
            <Head htmlAttrs={{lang}}>
                <meta charSet={charSet}/>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1"
                />
                <title>{props.heading}</title>
                <Link type={'text/css'} rel="stylesheet" href={Styles}/>
            </Head>
            {children}
        </WithMdx>
    );
};
