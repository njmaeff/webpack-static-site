import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

export const Template: React.FC<JSX.IntrinsicElements["template"]> = ({
    children,
    ...attrs
}) => {
    return (
        <template
            {...attrs}
            dangerouslySetInnerHTML={{
                __html: renderToStaticMarkup(<>{children}</>),
            }}
        />
    );
};
