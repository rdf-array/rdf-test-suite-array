import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IQueryEngine } from './IQueryEngine';
import type { ITestCaseSparql } from './ITestCaseSparql';
import type { IHttpContent } from './TestCaseProtocol';
/**
 * A single HTTP request of a graph store protocol test, together with its expected response.
 */
export interface IGraphStoreRequest {
    absolutePath: string;
    method: string;
    headers: [string, string][];
    body?: IHttpContent;
    expectedStatuses: number[];
    expectedStatusClasses: number[];
    expectedLocation?: string;
    expectedHeaders: [string, string][];
    expectedBody?: IHttpContent;
}
export interface IGraphStoreProtocolTestOptions {
    /** The SPARQL Graph Store Protocol endpoint that the requests are sent to. */
    graphStoreEndpoint?: string;
}
export interface ITestCaseGraphStoreProtocolProps {
    requests: IGraphStoreRequest[];
    requiredFeatures: string[];
}
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#GraphStoreProtocolTest.
 */
export declare class TestCaseGraphStoreProtocolHandler implements ITestCaseHandler<TestCaseGraphStoreProtocol> {
    /**
     * Interpret the ht:headers of a ht:Request or ht:Response.
     * @param resource A ht:Request or ht:Response resource.
     */
    static getHeaders(resource: Resource): [string, string][];
    /**
     * Interpret a cnt:ContentAsText resource.
     * @param content A cnt:ContentAsText resource.
     */
    static getContent(content: Resource): IHttpContent;
    /**
     * Interpret a mf:expectedStatus value as either a concrete status code or a status code class.
     * @param status A mf:expectedStatus value.
     * @param uri The URI of the test case the status belongs to, used for error reporting.
     */
    static getExpectedStatus(status: string, uri: string): {
        status?: number;
        statusClass?: number;
    };
    /**
     * Interpret a single ht:Request resource, together with the ht:Response it is expected to produce.
     * @param request A ht:Request resource.
     * @param uri The URI of the test case the request belongs to, used for error reporting.
     */
    static getRequest(request: Resource, uri: string): IGraphStoreRequest;
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData): Promise<TestCaseGraphStoreProtocol>;
}
export declare class TestCaseGraphStoreProtocol implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly requests: IGraphStoreRequest[];
    readonly requiredFeatures: string[];
    constructor(testCaseData: ITestCaseData, props: ITestCaseGraphStoreProtocolProps);
    /**
     * Determine the endpoint that the graph store protocol requests must be sent to.
     * @param injectArguments The custom engine options.
     */
    static getEndpoint(injectArguments: IGraphStoreProtocolTestOptions): string;
    /**
     * Replace the manifest path prefix of the given request path with the path of the endpoint under test.
     * @param endpoint The endpoint under test.
     * @param absolutePath A ht:absolutePath value.
     */
    static resolveRequestUrl(endpoint: string, absolutePath: string): string;
    /**
     * Determine the class of the given HTTP status code, e.g. 2 for 204.
     * @param status An HTTP status code.
     */
    static statusClass(status: number): number;
    /**
     * Determine the media type of a content type header value, without any of its parameters.
     * @param contentType A content type header value.
     */
    static mediaType(contentType: string): string;
    /**
     * Replace all template variables in the given string with the values they have been bound to.
     * @param value The string to fill the template variables in.
     * @param templates The values of the template variables, indexed by variable.
     */
    static fillTemplates(value: string, templates: Record<string, string>): string;
    test(_engine: IQueryEngine, injectArguments: IGraphStoreProtocolTestOptions): Promise<void>;
    /**
     * Delete every graph that this test case addresses, so that it starts from a known state.
     * The responses are ignored, as the graphs are not required to exist.
     * @param endpoint The endpoint under test.
     */
    protected clearGraphs(endpoint: string): Promise<void>;
    /**
     * Send a single request of this test case to the endpoint, and validate its response.
     * @param endpoint The endpoint under test.
     * @param request The request to send.
     * @param templates The template variables bound by the previous requests, extended by this request.
     */
    protected testRequest(endpoint: string, request: IGraphStoreRequest, templates: Record<string, string>): Promise<void>;
    /**
     * Validate that the status of a response is one of the statuses that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param status The status of the response.
     * @param body The body of the response.
     */
    protected validateStatus(request: IGraphStoreRequest, url: string, status: number, body: string): void;
    /**
     * Determine the location that a response points to, which subsequent requests in this test case refer to.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param response The response that was received.
     */
    static getLocation(request: IGraphStoreRequest, url: string, response: Response): string;
    /**
     * Validate that the headers of a response match the headers that the manifest expects.
     * Content type parameters such as the character encoding are not compared.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param response The response that was received.
     */
    static validateHeaders(request: IGraphStoreRequest, url: string, response: Response): void;
    /**
     * Validate that the body of a response is isomorphic to the graph that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param response The response that was received.
     * @param body The body of the response.
     */
    static validateBody(request: IGraphStoreRequest, url: string, response: Response, body: string): Promise<void>;
    /**
     * Parse an RDF graph that was sent over HTTP.
     * @param contentType The content type the graph is serialized in.
     * @param url The URL that the graph is a representation of, which relative IRIs are resolved against.
     * @param body The serialized graph.
     * @param label The kind of body that is being parsed, used for error reporting.
     */
    static parseBody(contentType: string, url: string, body: string, label: string): Promise<RDF.Quad[]>;
}
