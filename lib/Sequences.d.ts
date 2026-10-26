import type * as RDF from '@rdfjs/types';
export interface ILadderVocabulary {
    first: RDF.NamedNode;
    rest: RDF.NamedNode;
    nil: RDF.NamedNode;
}
/** Rdf:first/rdf:rest/rdf:nil: what an RDF 1.1 consumer such as rdf-object expects of a list. */
export declare const RDF_LADDER: ILadderVocabulary;
/**
 * A vocabulary no data uses, so that a sequence never compares equal to a ladder that the data
 * spells out with rdf:first/rdf:rest (rdf-array keeps those as ordinary triples).
 */
export declare const PRIVATE_LADDER: ILadderVocabulary;
/**
 * Replace every sequence term (nested ones and those inside quoted triples included) by the head of
 * a ladder in the given vocabulary, adding the ladder's quads in the quad's graph.
 */
export declare function expandSequences(quads: RDF.Quad[], vocabulary?: ILadderVocabulary): RDF.Quad[];
/** Whether a quad mentions a sequence anywhere. */
export declare function hasSequence(quads: RDF.Quad[]): boolean;
/**
 * Rdf-isomorphic, for graphs that may hold sequences: blank nodes inside sequences are matched like
 * any other, and a sequence never matches an rdf:first/rdf:rest ladder.
 */
export declare function isomorphic(a: RDF.Quad[], b: RDF.Quad[]): boolean;
