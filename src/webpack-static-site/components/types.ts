import {Primitive} from "type-fest"

export type PHPProps = Record<string, Primitive>;
export type PHPMeta<T extends PHPProps = any> = {
    props?: T
    includeDocType?: boolean,
    namespaceBase?: string[]
}
