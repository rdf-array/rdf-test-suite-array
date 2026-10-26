import type * as RDF from '@rdfjs/types';
import type { IQueryResult, IQueryResultQuads } from './IQueryEngine';
/**
 * Holds quad-based query results.
 */
export declare class QueryResultQuads implements IQueryResultQuads {
    readonly type = "quads";
    value: RDF.Quad[];
    constructor(value: RDF.Quad[]);
    equals(that: IQueryResult): boolean;
    toString(): string;
}
