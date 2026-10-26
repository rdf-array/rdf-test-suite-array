import type { IQueryResult, IQueryResultBoolean } from './IQueryEngine';
/**
 * Holds a boolean query result.
 */
export declare class QueryResultBoolean implements IQueryResultBoolean {
    readonly type = "boolean";
    value: boolean;
    constructor(value: boolean);
    equals(that: IQueryResult): boolean;
    toString(): string;
}
