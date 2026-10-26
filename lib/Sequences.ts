import type * as RDF from '@rdfjs/types';
import { DataFactory } from 'rdf-data-factory';
import { isomorphic as isomorphicTerms } from 'rdf-isomorphic';

/**
 * Rdf-array: a sequence is a term holding its elements (`termType: 'Sequence'`, `elements`), not a
 * ladder of rdf:first/rdf:rest blank nodes. Two helpers let the suite runner handle such terms:
 * manifests are read as RDF 1.1 lists, and graphs are compared with their blank nodes, inside
 * sequences included, as variables.
 */

const DF = new DataFactory();
// One counter for the whole process: manifests accumulate in one rdf-object loader, so ladder cells
// from different documents must never share a label
let counter = 0;
const RDF_NS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const SEQ_NS = 'urn:rdf-array:sequence#';

export interface ILadderVocabulary {
  first: RDF.NamedNode;
  rest: RDF.NamedNode;
  nil: RDF.NamedNode;
}

/** Rdf:first/rdf:rest/rdf:nil: what an RDF 1.1 consumer such as rdf-object expects of a list. */
export const RDF_LADDER: ILadderVocabulary = {
  first: DF.namedNode(`${RDF_NS}first`),
  rest: DF.namedNode(`${RDF_NS}rest`),
  nil: DF.namedNode(`${RDF_NS}nil`),
};

/**
 * A vocabulary no data uses, so that a sequence never compares equal to a ladder that the data
 * spells out with rdf:first/rdf:rest (rdf-array keeps those as ordinary triples).
 */
export const PRIVATE_LADDER: ILadderVocabulary = {
  first: DF.namedNode(`${SEQ_NS}first`),
  rest: DF.namedNode(`${SEQ_NS}rest`),
  nil: DF.namedNode(`${SEQ_NS}nil`),
};

function isSequence(term: any): term is { termType: 'Sequence'; elements: RDF.Term[] } {
  return term && term.termType === 'Sequence';
}

/**
 * Replace every sequence term (nested ones and those inside quoted triples included) by the head of
 * a ladder in the given vocabulary, adding the ladder's quads in the quad's graph.
 */
export function expandSequences(quads: RDF.Quad[], vocabulary: ILadderVocabulary = PRIVATE_LADDER): RDF.Quad[] {
  const out: RDF.Quad[] = [];
  const expand = (term: any, graph: RDF.Quad_Graph): any => {
    if (isSequence(term)) {
      const cells = term.elements.map(() => DF.blankNode(`rdfarrayseq${counter++}`));
      for (const [ i, element ] of term.elements.entries()) {
        out.push(DF.quad(cells[i], vocabulary.first, expand(element, graph), graph));
        out.push(DF.quad(cells[i], vocabulary.rest, i + 1 < cells.length ? cells[i + 1] : vocabulary.nil, graph));
      }
      return cells.length > 0 ? cells[0] : vocabulary.nil;
    }
    if (term && term.termType === 'Quad') {
      return DF.quad(expand(term.subject, graph), term.predicate, expand(term.object, graph), term.graph);
    }
    return term;
  };
  for (const quad of quads) {
    out.push(DF.quad(expand(quad.subject, quad.graph), quad.predicate, expand(quad.object, quad.graph), quad.graph));
  }
  return out;
}

/** Whether a quad mentions a sequence anywhere. */
export function hasSequence(quads: RDF.Quad[]): boolean {
  const visit = (term: any): boolean => isSequence(term) ||
    (term && term.termType === 'Quad' && (visit(term.subject) || visit(term.object)));
  return quads.some(quad => visit(quad.subject) || visit(quad.object));
}

/**
 * Rdf-isomorphic, for graphs that may hold sequences: blank nodes inside sequences are matched like
 * any other, and a sequence never matches an rdf:first/rdf:rest ladder.
 */
export function isomorphic(a: RDF.Quad[], b: RDF.Quad[]): boolean {
  if (!hasSequence(a) && !hasSequence(b)) {
    return isomorphicTerms(a, b);
  }
  return isomorphicTerms(expandSequences(a), expandSequences(b));
}
