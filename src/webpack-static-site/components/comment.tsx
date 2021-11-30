import React from "react";

export const Comment: React.FC = ({ children }) => {
    return (
        // @ts-ignore
        <sc-react-comment
            dangerouslySetInnerHTML={{ __html: `<!-- ${children} -->` }}
        />
    );
};

