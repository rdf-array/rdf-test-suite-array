"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseQueryEvaluation = exports.TestCaseQueryEvaluationHandler = void 0;
const arrayify_stream_1 = require("arrayify-stream");
const rdf_data_factory_1 = require("rdf-data-factory");
const rdf_object_1 = require("rdf-object");
const rdf_string_1 = require("rdf-string");
const rdf_string_ttl_1 = require("rdf-string-ttl");
const rdf_terms_1 = require("rdf-terms");
const sparqljson_parse_1 = require("sparqljson-parse");
const sparqlxml_parse_1 = require("sparqlxml-parse");
const ErrorTest_1 = require("../../ErrorTest");
const Util_1 = require("../../Util");
const QueryResultBindings_1 = require("./QueryResultBindings");
const QueryResultBoolean_1 = require("./QueryResultBoolean");
const QueryResultQuads_1 = require("./QueryResultQuads");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
const DF = new rdf_data_factory_1.DataFactory();
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#QueryEvaluationTest.
 */
class TestCaseQueryEvaluationHandler {
    /**
     * Parse SPARQL query results in any of the following content types:
     * * application/sparql-results+xml (bindings/ask)
     * * application/sparql-results+json (bindings/ask)
     * * Any RDF serialization (quads)
     *
     * If the results has as first triple '[] a <http://www.w3.org/2001/sw/DataAccess/tests/result-set#ResultSet>',
     * the it will be considered as a DAWG result set, and parsed as such. (bindings)
     *
     * @param {string} contentType The content type.
     * @param {string} url The base IRI.
     * @param {NodeJS.ReadableStream} data The data stream to parse.
     * @return {Promise<IQueryResult>} A promise resolving to a SPARQL query result.
     */
    static parseQueryResult(contentType, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryResult;
            try {
                const rdfStream = Util_1.Util.parseRdfRaw(contentType, url, data);
                queryResult = new QueryResultQuads_1.QueryResultQuads(yield (0, arrayify_stream_1.arrayifyStream)(rdfStream));
            }
            catch (_a) {
                // Fallthrough to the next cases
            }
            if (contentType.includes('application/sparql-results+xml') || url.endsWith('.srx')) {
                contentType = 'application/sparql-results+xml';
                queryResult = yield TestCaseQueryEvaluationHandler.parseSparqlResults('xml', data);
            }
            if (contentType.includes('application/sparql-results+json') || url.endsWith('.srj')) {
                queryResult = yield TestCaseQueryEvaluationHandler.parseSparqlResults('json', data);
            }
            if (contentType.includes('text/tab-separated-values') || url.endsWith('.tsv')) {
                queryResult = yield TestCaseQueryEvaluationHandler.parseSparqlTsvResults(data);
            }
            if (!queryResult) {
                throw new Error(`Could not parse the query result with content type ${contentType} at ${url}`);
            }
            // Discover DAWG result sets
            if (queryResult.type === 'quads' && queryResult.value.length > 0 &&
                queryResult.value[0].predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
                queryResult.value[0].object.value === 'http://www.w3.org/2001/sw/DataAccess/tests/result-set#ResultSet') {
                return yield TestCaseQueryEvaluationHandler.parseDawgResultSet(queryResult.value);
            }
            return queryResult;
        });
    }
    /**
     * Parses query results in either SPARQL/JSON or SPARQL/XML query results syntax.
     * @param {string} type json or xml
     * @param {NodeJS.ReadableStream} data The data stream to parse.
     * @return {Promise<IQueryResult>} A promise resolving to a SPARQL query result.
     */
    static parseSparqlResults(type, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let booleanPromise;
            let bindingsStream;
            if (type === 'json') {
                const parser = new sparqljson_parse_1.SparqlJsonParser({ prefixVariableQuestionMark: true });
                booleanPromise = parser.parseJsonBooleanStream(data);
                bindingsStream = parser.parseJsonResultsStream(data);
            }
            else {
                const parser = new sparqlxml_parse_1.SparqlXmlParser({ prefixVariableQuestionMark: true });
                booleanPromise = parser.parseXmlBooleanStream(data);
                bindingsStream = parser.parseXmlResultsStream(data);
            }
            const bindingsPromise = Promise.all([
                new Promise((resolve) => {
                    bindingsStream
                        .on('variables', resolve)
                        .on('end', _ => resolve([]));
                }),
                (0, arrayify_stream_1.arrayifyStream)(bindingsStream),
            ]);
            // Parse both in parallel, and silence the errors
            let bindingsError = null;
            let booleanError = null;
            const parsingResults = yield Promise.all([
                booleanPromise.catch((e) => {
                    booleanError = e;
                    return null;
                }),
                bindingsPromise.catch((e) => {
                    bindingsError = e;
                    return null;
                }),
            ]);
            if (!booleanError) {
                return new QueryResultBoolean_1.QueryResultBoolean(parsingResults[0]);
            }
            if (!bindingsError) {
                return new QueryResultBindings_1.QueryResultBindings(parsingResults[1][0].map((variable) => `?${variable.value}`), parsingResults[1][1], false);
            }
            throw new Error(`Found no valid ASK or SELECT query.\n${bindingsError.message}\n${booleanError.message}`);
        });
    }
    /**
     * Parses query results in the DAWG vocabulary.
     * https://www.w3.org/2001/sw/DataAccess/tests/test-dawg.n3
     * @param {Quad[]} quads An array of quads.
     * @return {Promise<IQueryResultBindings | IQueryResultBoolean>} A promise resolving to a bindings or boolean results object.
     */
    static parseDawgResultSet(quads) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for a boolean result (ASK query)
            if (quads[1] && quads[1].predicate.value === 'http://www.w3.org/2001/sw/DataAccess/tests/result-set#boolean') {
                return new QueryResultBoolean_1.QueryResultBoolean(quads[1].object.value === 'true');
            }
            // Construct resources for easier interpretation of the bindings
            const objectLoader = new rdf_object_1.RdfObjectLoader({
                context: {
                    result: 'http://www.w3.org/2001/sw/DataAccess/tests/result-set#',
                    bindings: 'result:binding',
                    index: 'result:index',
                    resultVariables: 'result:resultVariable',
                    solutions: 'result:solution',
                    value: 'result:value',
                    variable: 'result:variable',
                },
            });
            yield objectLoader.importArray(quads);
            let resultSet = null;
            for (const resourceName in objectLoader.resources) {
                if (objectLoader.resources[resourceName]
                    .isA((0, rdf_string_1.stringToTerm)('http://www.w3.org/2001/sw/DataAccess/tests/result-set#ResultSet'))) {
                    resultSet = objectLoader.resources[resourceName];
                    break;
                }
            }
            if (!resultSet) {
                throw new Error(`No valid DAWG result set was found in ${quads}`);
            }
            // Get the variable names
            const variables = resultSet.properties.resultVariables
                .map((resource) => `?${resource.value}`);
            // Check if any binding has .index
            let checkOrder = false;
            const s = resultSet.properties.solutions;
            for (const solution of s) {
                if (solution.property.index) {
                    checkOrder = true;
                    break;
                }
            }
            // Ensure that the solutions are sorted by index
            const solutions = resultSet.properties.solutions;
            if (checkOrder) {
                solutions.sort((solution1, solution2) => Number.parseInt(solution1.property.index.value, 10) - Number.parseInt(solution2.property.index.value, 10));
            }
            // Collect the bindings as object
            const value = solutions.map((solution) => solution.properties.bindings.reduce((bindings, binding) => {
                bindings[`?${binding.property.variable.value}`] = binding.property.value.term;
                return bindings;
            }, {}));
            return new QueryResultBindings_1.QueryResultBindings(variables, value, checkOrder);
        });
    }
    /**
     * Parses query results from a SPARQL TSV stream.
     * @param {NodeJS.ReadableStream} data The data stream to parse.
     * @return {Promise<IQueryResult>} A promise resolving to a SPARQL query result.
     */
    static parseSparqlTsvResults(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield stringifyStream(data);
            const lines = text.replace(/\r?\n$/u, '').split(/\r?\n/u);
            if (lines.length === 1) {
                const singleLine = lines[0].trim().toLowerCase();
                if (singleLine === 'true') {
                    return new QueryResultBoolean_1.QueryResultBoolean(true);
                }
                if (singleLine === 'false') {
                    return new QueryResultBoolean_1.QueryResultBoolean(false);
                }
            }
            const variables = [];
            if (lines[0].trim() !== '') {
                const rawVariables = lines[0].split('\t');
                for (const raw of rawVariables) {
                    const variable = raw.trim();
                    if (variable === '') {
                        throw new Error('Invalid TSV result: Empty column on the first row.');
                    }
                    if ((!variable.startsWith('?') && !variable.startsWith('$')) || variable.length < 2) {
                        throw new Error(`Invalid TSV variable: ${variable}`);
                    }
                    if (variables.includes(variable)) {
                        throw new Error(`Invalid TSV result: The variable ${variable} is declared twice.`);
                    }
                    variables.push(variable);
                }
            }
            const value = [];
            for (let i = 1; i < lines.length; i++) {
                const fields = lines[i].split('\t');
                const isZeroVariableResultRow = variables.length === 0 && fields.length === 1 && fields[0] === '';
                if (fields.length !== variables.length && !isZeroVariableResultRow) {
                    throw new Error(`Invalid TSV row (Line ${i + 1}): expected ${variables.length} fields but found ${fields.length}.`);
                }
                const binding = {};
                for (const [j, variable] of variables.entries()) {
                    const field = fields[j].trim();
                    if (field.length > 0) {
                        try {
                            binding[variable] = TestCaseQueryEvaluationHandler.parseTsvTerm(field);
                        }
                        catch (error) {
                            throw new Error(`Failed to parse TSV value on Line ${i + 1}, Column '${variable}': ` +
                                `Invalid Turtle syntax in "${field}".\nOriginal error: ${error.message}`);
                        }
                    }
                }
                value.push(binding);
            }
            return new QueryResultBindings_1.QueryResultBindings(variables, value, false);
        });
    }
    /**
     * Parse a single field from a SPARQL TSV result into an RDF term.
     * @param {string} term The TSV field value.
     * @return {RDF.Term} The corresponding RDF term.
     */
    static parseTsvTerm(term) {
        if (/^[+-]?[0-9]+$/u.test(term)) {
            return DF.literal(term, DF.namedNode('http://www.w3.org/2001/XMLSchema#integer'));
        }
        if (/^[+-]?([0-9]+\.[0-9]*|\.[0-9]+)$/u.test(term)) {
            return DF.literal(term, DF.namedNode('http://www.w3.org/2001/XMLSchema#decimal'));
        }
        if (/^[+-]?([0-9]+\.[0-9]*|\.[0-9]+|[0-9]+)[eE][+-]?[0-9]+$/u.test(term)) {
            return DF.literal(term, DF.namedNode('http://www.w3.org/2001/XMLSchema#double'));
        }
        if (term === 'true' || term === 'false') {
            return DF.literal(term, DF.namedNode('http://www.w3.org/2001/XMLSchema#boolean'));
        }
        return (0, rdf_string_ttl_1.stringToTerm)(term);
    }
    /**
     * Obtain all data links for the given query test action.
     * @param action A query test action.
     */
    static getQueryDataLinks(action) {
        const queryDataLinks = [];
        if (action.property.data) {
            queryDataLinks.push({
                dataUri: action.property.data.value,
            });
        }
        for (const graphData of action.properties.graphData) {
            if (graphData.property.graph) {
                queryDataLinks.push({
                    dataUri: graphData.property.graph.value,
                    dataGraph: DF.namedNode(graphData.property.label.value),
                });
            }
            else {
                queryDataLinks.push({
                    dataUri: graphData.value,
                    dataGraph: DF.namedNode(graphData.value),
                });
            }
        }
        return queryDataLinks;
    }
    /**
     * Determine the quads for the given query data links.
     * @param queryDataLinks Links to query data.
     * @param options Fetch options.
     */
    static resolveQueryDataLinks(queryDataLinks, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryData = [];
            for (const queryDataLink of queryDataLinks) {
                let queryDataThis = yield (0, arrayify_stream_1.arrayifyStream)((yield Util_1.Util.fetchRdf(queryDataLink.dataUri, options))[1]);
                if (queryDataLink.dataGraph) {
                    queryDataThis = queryDataThis.map(quad => (0, rdf_terms_1.mapTerms)(quad, (value, key) => key === 'graph' ? queryDataLink.dataGraph : value));
                }
                queryData = [...queryData, ...queryDataThis];
            }
            return queryData;
        });
    }
    /**
     * Obtain all service data links for the given query test action.
     * @param action A query test action.
     */
    static getServiceDataLinks(action) {
        const serviceDataLinks = [];
        for (const serviceData of action.properties.serviceData) {
            serviceDataLinks.push({
                endpoint: serviceData.property.endpoint.value,
                dataUri: serviceData.property.data.value,
            });
        }
        return serviceDataLinks;
    }
    /**
     * Resolve service data links to a mapping of endpoint URIs to their quads.
     * @param serviceDataLinks Links to service data.
     * @param options Fetch options.
     */
    static resolveServiceDataLinks(serviceDataLinks, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceData = {};
            for (const link of serviceDataLinks) {
                serviceData[link.endpoint] = yield (0, arrayify_stream_1.arrayifyStream)((yield Util_1.Util.fetchRdf(link.dataUri, Object.assign(Object.assign({}, options), { normalizeUrl: true })))[1]);
            }
            return serviceData;
        });
    }
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            if (!resource.property.result) {
                throw new Error(`Missing mf:result in ${resource}`);
            }
            const action = resource.property.action;
            if (!action.property.query) {
                throw new Error(`Missing qt:query in mf:action of ${resource}`);
            }
            // Determine links to data
            const queryDataLinks = TestCaseQueryEvaluationHandler.getQueryDataLinks(action);
            // Determine links to service data (for federated query tests)
            const serviceDataLinks = TestCaseQueryEvaluationHandler.getServiceDataLinks(action);
            const mf = 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#';
            // Check for lax cardinality property
            let laxCardinality = false;
            if (resource.property.resultCardinality && resource.property.resultCardinality.value === `${mf}LaxCardinality`) {
                laxCardinality = true;
            }
            // Check for mf:requires mf:StringSimpleLiteralCmp
            let laxComparison = false;
            if (resource.property.requires && resource.properties.requires.map(r => r.term.value).includes(`${mf}StringSimpleLiteralCmp`)) {
                laxComparison = true;
            }
            // Collect all query data
            const queryData = yield TestCaseQueryEvaluationHandler.resolveQueryDataLinks(queryDataLinks, options);
            // Resolve service data for federated queries
            const serviceData = yield TestCaseQueryEvaluationHandler.resolveServiceDataLinks(serviceDataLinks, options);
            const queryResponse = yield Util_1.Util.fetchCached(resource.property.result.value, options);
            return new TestCaseQueryEvaluation(testCaseData, {
                baseIRI: action.property.query.value,
                queryDataLinks,
                serviceDataLinks,
                laxCardinality,
                queryData,
                serviceData,
                queryResult: yield TestCaseQueryEvaluationHandler.parseQueryResult(Util_1.Util.identifyContentType(queryResponse.url, queryResponse.headers), queryResponse.url, queryResponse.body),
                queryString: yield stringifyStream((yield Util_1.Util.fetchCached(action.property.query.value, options)).body),
                resultSource: queryResponse,
                laxComparison,
            });
        });
    }
}
exports.TestCaseQueryEvaluationHandler = TestCaseQueryEvaluationHandler;
class TestCaseQueryEvaluation {
    constructor(testCaseData, props) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
        Object.assign(this, props);
    }
    static queryDataLinksToString(queryDataLinks) {
        return queryDataLinks.map(queryDataLink => queryDataLink.dataUri + (queryDataLink.dataGraph ? ` (named graph: ${queryDataLink.dataGraph.value})` : '')).join(',\n    ');
    }
    static serviceDataLinksToString(serviceDataLinks) {
        if (serviceDataLinks.length === 0) {
            return 'None';
        }
        return serviceDataLinks.map(link => `${link.endpoint} (data: ${link.dataUri})`).join(',\n    ');
    }
    test(engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = Object.assign({ baseIRI: this.baseIRI, checkOrder: this.queryResult.type === 'bindings' ?
                    this.queryResult.checkOrder :
                    false, nonLexicalComparison: this.laxComparison, fullTermComparison: this.laxComparison, 
                // Always passed (also when empty), as SERVICE endpoints without service data must be considered unreachable
                serviceData: this.serviceData }, injectArguments);
            const result = yield engine.query(this.queryData, this.queryString, options);
            if (!this.queryResult.equals(result, this.laxCardinality)) {
                throw new ErrorTest_1.ErrorTest(`Invalid query evaluation

  Query:\n\n${this.queryString}

  Data links: ${TestCaseQueryEvaluation.queryDataLinksToString(this.queryDataLinks)}

  Service links: ${TestCaseQueryEvaluation.serviceDataLinksToString(this.serviceDataLinks)}

  Result Source: ${this.resultSource.url}

  Expected: ${this.queryResult.toString()}

  Got: \n ${result.toString()}
`);
            }
        });
    }
}
exports.TestCaseQueryEvaluation = TestCaseQueryEvaluation;
//# sourceMappingURL=TestCaseQueryEvaluation.js.map