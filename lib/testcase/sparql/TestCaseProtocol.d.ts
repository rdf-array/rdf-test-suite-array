import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IQueryEngine } from './IQueryEngine';
import type { ITestCaseSparql } from './ITestCaseSparql';
import type { IQueryDataLink } from './TestCaseQueryEvaluation';
export interface IProtocolTestOptions {
    /** The SPARQL endpoint that the protocol requests are sent to. */
    protocolEndpoint?: string;
}
/**
 * The contents of an HTTP message body, as described by a cnt:ContentAsText resource.
 */
export interface IHttpContent {
    chars: string;
    characterEncoding: string;
}
/**
 * A single HTTP request of a protocol test, together with its expected response.
 */
export interface IProtocolRequest {
    absolutePath: string;
    method: string;
    headers: [string, string][];
    body?: IHttpContent;
    expectedStatusClasses: number[];
    expectedFormat?: string;
    expectedBoolean?: boolean;
}
export interface ITestCaseProtocolProps {
    requests: IProtocolRequest[];
    graphData: RDF.Quad[];
    graphDataLinks: IQueryDataLink[];
}
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#ProtocolTest.
 */
export declare class TestCaseProtocolHandler implements ITestCaseHandler<TestCaseProtocol> {
    /**
     * Interpret a single ht:Request resource, together with the ht:Response it is expected to produce.
     * @param request A ht:Request resource.
     * @param uri The URI of the test case the request belongs to, used for error reporting.
     */
    static getRequest(request: Resource, uri: string): IProtocolRequest;
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseProtocol>;
}
export declare class TestCaseProtocol implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly requests: IProtocolRequest[];
    readonly graphData: RDF.Quad[];
    readonly graphDataLinks: IQueryDataLink[];
    constructor(testCaseData: ITestCaseData, props: ITestCaseProtocolProps);
    /**
     * Determine the endpoint that the protocol requests must be sent to.
     * @param injectArguments The custom engine options.
     */
    static getEndpoint(injectArguments: IProtocolTestOptions): string;
    /**
     * Replace the manifest path prefix of the given request path with the path of the endpoint under test.
     * @param endpoint The endpoint under test.
     * @param absolutePath A ht:absolutePath value.
     */
    static resolveRequestUrl(endpoint: string, absolutePath: string): string;
    /**
     * Serialize the given quads into a SPARQL update that resets the endpoint to just those quads.
     * @param quads The quads to load, which must all be contained in a named graph.
     */
    static createLoadUpdate(quads: RDF.Quad[]): string;
    /**
     * Determine the class of the given HTTP status code, e.g. 2 for 204.
     * @param status An HTTP status code.
     */
    static statusClass(status: number): number;
    test(_engine: IQueryEngine, injectArguments: IProtocolTestOptions): Promise<void>;
    /**
     * Load the ut:graphData of this test case into the endpoint via a SPARQL update.
     * @param endpoint The endpoint under test.
     */
    protected loadGraphData(endpoint: string): Promise<void>;
    /**
     * Send a single request of this test case to the endpoint, and validate its response.
     * @param endpoint The endpoint under test.
     * @param request The request to send.
     */
    protected testRequest(endpoint: string, request: IProtocolRequest): Promise<void>;
    /**
     * Encode the body of a request in the character encoding that the manifest declares for it.
     * @param body A ht:body value.
     */
    static encodeBody(body: IHttpContent): ArrayBuffer;
    /**
     * Validate that the content type of a response matches the format that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param contentType The content type of the response.
     */
    static validateFormat(request: IProtocolRequest, url: string, contentType: string): void;
    /**
     * Validate that the body of a response contains the boolean result that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param contentType The content type of the response.
     * @param body The body of the response.
     */
    static validateBoolean(request: IProtocolRequest, url: string, contentType: string, body: string): Promise<void>;
}
