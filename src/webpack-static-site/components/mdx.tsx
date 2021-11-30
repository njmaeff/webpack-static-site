import { MDXProvider } from "@mdx-js/react";
import React from "react";

export const WithMdx: React.FC<{ components?: { [key: string]: any } }> = ({
                                                                              children,
                                                                              components,
                                                                          }) => {
    return <MDXProvider components={components}>{children}</MDXProvider>;
};
