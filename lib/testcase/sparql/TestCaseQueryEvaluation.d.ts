import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { IFetchOptions, IFetchResponse } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IQueryEngine, IQueryResult, IQueryResultBindings, IQueryResultBoolean } from './IQueryEngine';
import type { ITestCaseSparql } from './ITestCaseSparql';
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#QueryEvaluationTest.
 */
export declare class TestCaseQueryEvaluationHandler implements ITestCaseHandler<TestCaseQueryEvaluation> {
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
    static parseQueryResult(contentType: string, url: string, data: NodeJS.ReadableStream): Promise<IQueryResult>;
    /**
     * Parses query results in either SPARQL/JSON or SPARQL/XML query results syntax.
     * @param {string} type json or xml
     * @param {NodeJS.ReadableStream} data The data stream to parse.
     * @return {Promise<IQueryResult>} A promise resolving to a SPARQL query result.
     */
    static parseSparqlResults(type: 'json' | 'xml', data: NodeJS.ReadableStream): Promise<IQueryResult>;
    /**
     * Parses query results in the DAWG vocabulary.
     * https://www.w3.org/2001/sw/DataAccess/tests/test-dawg.n3
     * @param {Quad[]} quads An array of quads.
     * @return {Promise<IQueryResultBindings | IQueryResultBoolean>} A promise resolving to a bindings or boolean results object.
     */
    static parseDawgResultSet(quads: RDF.Quad[]): Promise<IQueryResultBindings | IQueryResultBoolean>;
    /**
     * Parses query results from a SPARQL TSV stream.
     * @param {NodeJS.ReadableStream} data The data stream to parse.
     * @return {Promise<IQueryResult>} A promise resolving to a SPARQL query result.
     */
    static parseSparqlTsvResults(data: NodeJS.ReadableStream): Promise<IQueryResult>;
    /**
     * Parse a single field from a SPARQL TSV result into an RDF term.
     * @param {string} term The TSV field value.
     * @return {RDF.Term} The corresponding RDF term.
     */
    static parseTsvTerm(term: string): RDF.Term;
    /**
     * Obtain all data links for the given query test action.
     * @param action A query test action.
     */
    static getQueryDataLinks(action: Resource): IQueryDataLink[];
    /**
     * Determine the quads for the given query data links.
     * @param queryDataLinks Links to query data.
     * @param options Fetch options.
     */
    static resolveQueryDataLinks(queryDataLinks: IQueryDataLink[], options?: IFetchOptions): Promise<RDF.Quad[]>;
    /**
     * Obtain all service data links for the given query test action.
     * @param action A query test action.
     */
    static getServiceDataLinks(action: Resource): IServiceDataLink[];
    /**
     * Resolve service data links to a mapping of endpoint URIs to their quads.
     * @param serviceDataLinks Links to service data.
     * @param options Fetch options.
     */
    static resolveServiceDataLinks(serviceDataLinks: IServiceDataLink[], options?: IFetchOptions): Promise<Record<string, RDF.Quad[]>>;
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseQueryEvaluation>;
}
export interface ITestCaseQueryEvaluationProps {
    baseIRI: string;
    queryString: string;
    queryData: RDF.Quad[];
    serviceData: Record<string, RDF.Quad[]>;
    queryResult: IQueryResult;
    laxCardinality: boolean;
    laxComparison: boolean;
    resultSource: IFetchResponse;
    queryDataLinks: IQueryDataLink[];
    serviceDataLinks: IServiceDataLink[];
}
export interface IQueryDataLink {
    dataUri: string;
    dataGraph?: RDF.NamedNode;
}
export interface IServiceDataLink {
    endpoint: string;
    dataUri: string;
}
export declare class TestCaseQueryEvaluation implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly baseIRI: string;
    readonly queryString: string;
    readonly queryData: RDF.Quad[];
    readonly serviceData: Record<string, RDF.Quad[]>;
    readonly queryResult: IQueryResult;
    readonly laxCardinality: boolean;
    readonly laxComparison: boolean;
    readonly queryDataLinks: IQueryDataLink[];
    readonly serviceDataLinks: IServiceDataLink[];
    readonly resultSource: IFetchResponse;
    constructor(testCaseData: ITestCaseData, props: ITestCaseQueryEvaluationProps);
    static queryDataLinksToString(queryDataLinks: IQueryDataLink[]): string;
    static serviceDataLinksToString(serviceDataLinks: IServiceDataLink[]): string;
    test(engine: IQueryEngine, injectArguments: any): Promise<void>;
}
