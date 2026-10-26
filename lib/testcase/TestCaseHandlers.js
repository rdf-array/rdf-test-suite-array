"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestCaseJsonLdFromRdf_1 = require("./rdfsyntax/jsonld/TestCaseJsonLdFromRdf");
const TestCaseJsonLdFromRdfNegative_1 = require("./rdfsyntax/jsonld/TestCaseJsonLdFromRdfNegative");
const TestCaseJsonLdSyntax_1 = require("./rdfsyntax/jsonld/TestCaseJsonLdSyntax");
const TestCaseJsonLdToRdf_1 = require("./rdfsyntax/jsonld/TestCaseJsonLdToRdf");
const TestCaseJsonLdToRdfNegative_1 = require("./rdfsyntax/jsonld/TestCaseJsonLdToRdfNegative");
const TestCaseEval_1 = require("./rdfsyntax/TestCaseEval");
const TestCaseSyntax_1 = require("./rdfsyntax/TestCaseSyntax");
const TestCaseCsvResultFormat_1 = require("./sparql/TestCaseCsvResultFormat");
const TestCaseGraphStoreProtocol_1 = require("./sparql/TestCaseGraphStoreProtocol");
const TestCaseNegativeSyntax_1 = require("./sparql/TestCaseNegativeSyntax");
const TestCasePositiveSyntax_1 = require("./sparql/TestCasePositiveSyntax");
const TestCaseProtocol_1 = require("./sparql/TestCaseProtocol");
const TestCaseQueryEvaluation_1 = require("./sparql/TestCaseQueryEvaluation");
const TestCaseServiceDescription_1 = require("./sparql/TestCaseServiceDescription");
const TestCaseUpdateEvaluation_1 = require("./sparql/TestCaseUpdateEvaluation");
module.exports = {
    // SPARQL 1.0, SPARQL 1.1 test suite
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#NegativeSyntaxTest': new TestCaseNegativeSyntax_1.TestCaseNegativeSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#PositiveSyntaxTest': new TestCasePositiveSyntax_1.TestCasePositiveSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#NegativeUpdateSyntaxTest': new TestCaseNegativeSyntax_1.TestCaseNegativeSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#PositiveUpdateSyntaxTest': new TestCasePositiveSyntax_1.TestCasePositiveSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#QueryEvaluationTest': new TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler(),
    // SPARQL 1.1 test suite
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#NegativeSyntaxTest11': new TestCaseNegativeSyntax_1.TestCaseNegativeSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#PositiveSyntaxTest11': new TestCasePositiveSyntax_1.TestCasePositiveSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#NegativeUpdateSyntaxTest11': new TestCaseNegativeSyntax_1.TestCaseNegativeSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#PositiveUpdateSyntaxTest11': new TestCasePositiveSyntax_1.TestCasePositiveSyntaxHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#UpdateEvaluationTest': new TestCaseUpdateEvaluation_1.TestCaseUpdateEvaluationHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#CSVResultFormatTest': new TestCaseCsvResultFormat_1.TestCaseCsvResultFormatHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#ServiceDescriptionTest': new TestCaseServiceDescription_1.TestCaseServiceDescriptionHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#ProtocolTest': new TestCaseProtocol_1.TestCaseProtocolHandler(),
    'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#GraphStoreProtocolTest': new TestCaseGraphStoreProtocol_1.TestCaseGraphStoreProtocolHandler(),
    // RDF/XML test suite
    'http://www.w3.org/ns/rdftest#TestXMLEval': new TestCaseEval_1.TestCaseEvalHandler(),
    'http://www.w3.org/ns/rdftest#TestXMLNegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    // N-Triples test suite
    'http://www.w3.org/ns/rdftest#TestNTriplesPositiveSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(true),
    'http://www.w3.org/ns/rdftest#TestNTriplesNegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    // N-Quads test suite
    'http://www.w3.org/ns/rdftest#TestNQuadsPositiveSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(true),
    'http://www.w3.org/ns/rdftest#TestNQuadsNegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    // Turtle test suite
    'http://www.w3.org/ns/rdftest#TestTurtleEval': new TestCaseEval_1.TestCaseEvalHandler(),
    'http://www.w3.org/ns/rdftest#TestTurtlePositiveSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(true),
    'http://www.w3.org/ns/rdftest#TestTurtleNegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    'http://www.w3.org/ns/rdftest#TestTurtleNegativeEval': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    // TriG test suite
    'http://www.w3.org/ns/rdftest#TestTrigEval': new TestCaseEval_1.TestCaseEvalHandler(),
    'http://www.w3.org/ns/rdftest#TestTrigPositiveSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(true),
    'http://www.w3.org/ns/rdftest#TestTrigNegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    'http://www.w3.org/ns/rdftest#TestTrigNegativeEval': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    // JSON-LD test suite
    'https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest https://w3c.github.io/json-ld-api/tests/vocab#PositiveEvaluationTest': new TestCaseJsonLdToRdf_1.TestCaseJsonLdToRdfHandler(),
    'https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest https://w3c.github.io/json-ld-api/tests/vocab#PositiveSyntaxTest': new TestCaseJsonLdSyntax_1.TestCaseJsonLdSyntaxHandler(true),
    'https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest https://w3c.github.io/json-ld-api/tests/vocab#NegativeEvaluationTest': new TestCaseJsonLdToRdfNegative_1.TestCaseJsonLdToRdfNegativeHandler(),
    'https://w3c.github.io/json-ld-api/tests/vocab#FromRDFTest https://w3c.github.io/json-ld-api/tests/vocab#PositiveEvaluationTest': new TestCaseJsonLdFromRdf_1.TestCaseJsonLdFromRdfHandler(),
    'https://w3c.github.io/json-ld-api/tests/vocab#FromRDFTest https://w3c.github.io/json-ld-api/tests/vocab#NegativeEvaluationTest': new TestCaseJsonLdFromRdfNegative_1.TestCaseJsonLdFromRdfNegativeHandler(),
    // RDFa test suite
    'http://rdfa.info/vocabs/rdfa-test#PositiveEvaluationTest': new TestCaseEval_1.TestCaseEvalHandler(),
    'http://rdfa.info/vocabs/rdfa-test#NegativeEvaluationTest': new TestCaseSyntax_1.TestCaseSyntaxHandler(true), // RDFa test suite never expect errors, just empty documents
    // Microdata-RDF test suite
    'http://www.w3.org/ns/rdftest#TestMicrodataEval': new TestCaseEval_1.TestCaseEvalHandler({ normalizeUrl: true }),
    'http://www.w3.org/ns/rdftest#TestMicrodataNegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(true), // Microdata-RDF test suite never expect errors, just empty documents
    // N3 test suite
    'https://w3c.github.io/N3/tests/test.n3#TestN3PositiveSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(true),
    'https://w3c.github.io/N3/tests/test.n3#TestN3NegativeSyntax': new TestCaseSyntax_1.TestCaseSyntaxHandler(false),
    'https://w3c.github.io/N3/tests/test.n3#TestN3Eval': new TestCaseEval_1.TestCaseEvalHandler(),
};
//# sourceMappingURL=TestCaseHandlers.js.map