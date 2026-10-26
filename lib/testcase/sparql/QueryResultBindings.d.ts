import type * as RDF from '@rdfjs/types';
import type { IQueryResult, IQueryResultBindings } from './IQueryEngine';
/**
 * Holds bindings-based query results.
 */
export declare class QueryResultBindings implements IQueryResultBindings {
    readonly type = "bindings";
    variables: string[];
    value: Record<string, RDF.Term>[];
    checkOrder: boolean;
    constructor(variables: string[], value: Record<string, RDF.Term>[], checkOrder: boolean);
    static serializeTerm(term: RDF.Term, blankNodeCounters: Record<string, number>): any;
    static hashBinding(binding: Record<string, RDF.Term>, blankNodeCounters: Record<string, number>): any;
    static hashBindings(bindings: Record<string, RDF.Term>[], blankNodeCounters: Record<string, number>, checkOrder: boolean): string;
    static hashBindingsCount(bindings: Record<string, RDF.Term>[], blankNodeCounters: Record<string, number>): Record<string, number>;
    equals(that: IQueryResult, laxCardinality?: boolean): boolean;
    toString(): string;
}
