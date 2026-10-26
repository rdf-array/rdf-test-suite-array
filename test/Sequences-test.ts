import { DataFactory } from 'rdf-data-factory';
import { expandSequences, hasSequence, isomorphic, PRIVATE_LADDER, RDF_LADDER } from '../lib/Sequences';

const DF: any = new DataFactory();
const ex = (local: string) => DF.namedNode(`http://ex.org/${local}`);
const seq = (...elements: any[]) => DF.sequence(elements);

describe('Sequences', () => {
  describe('expandSequences', () => {
    it('leaves quads without sequences alone', () => {
      const quads = [ DF.quad(ex('s'), ex('p'), ex('o')) ];
      expect(expandSequences(quads)).toEqual(quads);
      expect(hasSequence(quads)).toBe(false);
    });

    it('turns a sequence into an rdf:first/rdf:rest ladder', () => {
      const quads = expandSequences([ DF.quad(ex('s'), ex('p'), seq(ex('a'), ex('b'))) ], RDF_LADDER);
      expect(quads).toHaveLength(5);
      expect(quads.filter(q => q.predicate.equals(RDF_LADDER.first)).map(q => q.object.value))
        .toEqual([ 'http://ex.org/a', 'http://ex.org/b' ]);
      expect(quads.some(q => q.object.equals(RDF_LADDER.nil))).toBe(true);
    });

    it('turns the empty sequence into nil, and nests', () => {
      const quads = expandSequences([ DF.quad(seq(), ex('p'), seq(seq(ex('a')))) ]);
      expect(quads.find(q => q.predicate.equals(ex('p'))).subject).toEqual(PRIVATE_LADDER.nil);
      expect(quads).toHaveLength(5);
      expect(hasSequence(quads)).toBe(false);
    });

    it('never reuses a cell label', () => {
      const a = expandSequences([ DF.quad(ex('s'), ex('p'), seq(ex('a'))) ]);
      const b = expandSequences([ DF.quad(ex('s'), ex('p'), seq(ex('a'))) ]);
      expect(a[0].subject.value).not.toEqual(b[0].subject.value);
    });
  });

  describe('isomorphic', () => {
    it('matches blank nodes inside sequences', () => {
      expect(isomorphic(
        [ DF.quad(ex('s'), ex('p'), seq(DF.blankNode('x'))), DF.quad(DF.blankNode('x'), ex('q'), ex('o')) ],
        [ DF.quad(ex('s'), ex('p'), seq(DF.blankNode('y'))), DF.quad(DF.blankNode('y'), ex('q'), ex('o')) ],
      )).toBe(true);
    });

    it('tells sequences apart by their elements', () => {
      expect(isomorphic(
        [ DF.quad(ex('s'), ex('p'), seq(ex('a'), ex('b'))) ],
        [ DF.quad(ex('s'), ex('p'), seq(ex('b'), ex('a'))) ],
      )).toBe(false);
    });

    it('never matches a sequence with the ladder data spell out', () => {
      const ladder = [
        DF.quad(ex('s'), ex('p'), DF.blankNode('l')),
        DF.quad(DF.blankNode('l'), RDF_LADDER.first, ex('a')),
        DF.quad(DF.blankNode('l'), RDF_LADDER.rest, RDF_LADDER.nil),
      ];
      expect(isomorphic(ladder, [ DF.quad(ex('s'), ex('p'), seq(ex('a'))) ])).toBe(false);
      expect(isomorphic([ DF.quad(ex('s'), ex('p'), seq()) ], [ DF.quad(ex('s'), ex('p'), RDF_LADDER.nil) ]))
        .toBe(false);
    });
  });
});
