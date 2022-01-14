import {Primitive} from "type-fest"
import React from "react";

export type PHPProps = Record<string, Primitive>;
export type PHPMeta<T extends PHPProps = any> = {
    props?: T
    includeDocType?: boolean,
}
export type PHPTemplate<T extends PHPProps = any> = React.FC<T> & PHPMeta<T>
