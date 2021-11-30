import React from "react";
import { getPathFromUrl } from "../util/url";

export const Link: React.FC<JSX.IntrinsicElements["link"]> = ({
    children,
    href,
    ...props
}) => {
    const ref = getPathFromUrl(href);
    return (
        <link href={ref} {...props}>
            {children}
        </link>
    );
};
