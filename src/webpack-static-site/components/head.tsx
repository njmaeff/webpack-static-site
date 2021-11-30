import React from "react";
import {renderToStaticMarkup} from "react-dom/server";

const FromChildren = ({children}) => <>{children}</>;

class ChildrenBuilder {
    count = -1;
    components = [];


    add(children) {
        this.count++;
        this.components.push(
            <FromChildren key={this.count}>{children}</FromChildren>
        )
    }
}

const childrenBuilder = new ChildrenBuilder()

const htmlAttributes = {};
const bodyAttributes = {};

export const Head: React.FC<{
    htmlAttrs?: JSX.IntrinsicElements["html"];
    bodyAttrs?: JSX.IntrinsicElements["body"];
}> = ({children, htmlAttrs, bodyAttrs}) => {
    Object.assign(htmlAttributes, htmlAttrs);
    Object.assign(bodyAttributes, bodyAttrs);

    childrenBuilder.add(children);
    return <></>;
};

const ObjectToAttributeString = (obj) => {
    const attrs = [];
    for (const [key, value] of Object.entries(obj)) {
        attrs.push(`${key}=${JSON.stringify(value)}`);
    }
    return attrs.join(" ");
};

export const renderHeadStatic = () => {
    return {
        htmlAttrs: ObjectToAttributeString(htmlAttributes),
        bodyAttrs: ObjectToAttributeString(bodyAttributes),
        head: renderToStaticMarkup(<>{...childrenBuilder.components}</>)
    }
}
