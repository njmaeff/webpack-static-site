import React from "react";
import {Primitive} from "type-fest"

export type PHPProps = Record<string, Primitive>;
export type PHPTemplate<T extends PHPProps = any> =
    React.FC<T>
    & {
    props?: T
    includeDocType?: boolean
}
