# rdf-test-suite-array: the W3C test runner for rdf-array

rdf-array is RDF with one more kind of term, the **sequence**: `(1 2 3)` in Turtle is one term, not a
ladder of `rdf:first`/`rdf:rest` blank nodes, and `()` is the empty sequence, not `rdf:nil`. See
[rdf-array.md](https://rdf-array.github.io/rdf-array/rdf-array.html).

This fork of [rdf-test-suite.js](https://github.com/rubensworks/rdf-test-suite.js) v2.9.0 lets the
JavaScript forks run the shared suites ([rdf-tests-array](https://github.com/rdf-array/rdf-tests-array),
[rdf-tests-contrib](https://github.com/rdf-array/rdf-tests-contrib), …), whose expected results are
written with sequences. Vanilla rdf-test-suite read those expectations with the stock N3.js, which cannot
parse `( … )`, and dropped every such test without saying so.

## What changed

- **Dependencies.** `n3`, `rdf-string`, `rdf-string-ttl`, `rdf-terms`, `rdf-data-factory`,
  `jsonld-streaming-parser`, `rdfxml-streaming-parser`, `sparqljson-parse` and `sparqlxml-parse` point at
  their rdf-array forks (branch `rdf-sequences`); `resolutions` and `overrides` pin `@rdfjs/types` and the
  nested copies. The compiled `lib/`, `bin/` and `index.js` are committed, because yarn 1 runs no `prepare`
  script for a git dependency.
- **`lib/Sequences.ts`.** `expandSequences(quads, vocabulary)` replaces each sequence (nested, or inside a
  quoted triple) by the head of a ladder; `isomorphic(a, b)` is rdf-isomorphic over the graphs expanded into a
  private vocabulary (`urn:rdf-array:sequence#first|rest|nil`), so blank nodes inside sequences match like any
  other and a sequence never matches a ladder spelled with `rdf:first`/`rdf:rest`.
- **Manifests.** `ManifestLoader` expands the sequences of a manifest into `rdf:first`/`rdf:rest` ladders
  before rdf-object reads it, since `mf:entries ( … )` and JSON-LD's `"@container": "@list"` are RDF 1.1 lists
  there. The cells' labels are unique across the process, as one loader holds every sub-manifest.
- **Comparisons.** The syntax evaluation, CONSTRUCT and DESCRIBE results, update results and Graph Store
  Protocol tests use `Sequences.isomorphic`; SPARQL bindings serialize a sequence element by element, its blank
  nodes normalized with the rest.

## Tests

`yarn test`: 428 passed, 10 skipped. The protocol tests' fixtures are Turtle strings read straight into
rdf-object, so their helpers expand sequences as the manifest loader does. `test/Sequences-test.ts` is new.
The end-to-end tests (`test/e2e-test.ts`) are skipped: they run the original W3C suites, whose expectations are
ladders, through rdf-parse and comunica, which resolve here to the rdf-array parsers; the forks that use this
runner run the -array and -contrib suites instead. Upstream v2.9.0 passes all 431 of its tests.

## Used by

[N3.js-array](https://github.com/rdf-array/N3.js-array) (`npm run spec`) and
[comunica-array](https://github.com/rdf-array/comunica-array) (`spec:*` scripts), through
`"rdf-test-suite": "github:rdf-array/rdf-test-suite-array#rdf-sequences"`.
