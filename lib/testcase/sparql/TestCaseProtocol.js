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
exports.TestCaseProtocol = exports.TestCaseProtocolHandler = void 0;
const rdf_string_ttl_1 = require("rdf-string-ttl");
const ErrorTest_1 = require("../../ErrorTest");
const TestCaseQueryEvaluation_1 = require("./TestCaseQueryEvaluation");
const TestCaseUpdateEvaluation_1 = require("./TestCaseUpdateEvaluation");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const streamifyString = require('streamify-string');
/**
 * The path prefix that every ht:absolutePath in the SPARQL 1.1 Protocol manifest starts with.
 * It is replaced by the path of the endpoint under test.
 */
const MANIFEST_PATH_PREFIX = '/sparql/';
const STATUS_CODE_CLASS_REGEX = /^http:\/\/www\.w3\.org\/2011\/http-statusCodes#StatusCode(\d)xx$/u;
/**
 * The content types that are considered valid for each of the mf:expectedFormat values.
 */
const EXPECTED_FORMAT_CONTENT_TYPES = {
    boolean: [
        'application/sparql-results+json',
        'application/sparql-results+xml',
    ],
    tabular: [
        'application/sparql-results+json',
        'application/sparql-results+xml',
        'text/csv',
        'text/tab-separated-values',
    ],
    RDF: [
        'application/rdf+xml',
        'text/turtle',
        'application/x-turtle',
        'application/n-triples',
        'application/n-quads',
        'application/trig',
        'application/ld+json',
    ],
};
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#ProtocolTest.
 */
class TestCaseProtocolHandler {
    /**
     * Interpret a single ht:Request resource, together with the ht:Response it is expected to produce.
     * @param request A ht:Request resource.
     * @param uri The URI of the test case the request belongs to, used for error reporting.
     */
    static getRequest(request, uri) {
        var _a;
        if (!request.property.httpAbsolutePath) {
            throw new Error(`Missing ht:absolutePath in a ht:Request of ${uri}`);
        }
        if (!request.property.httpMethodName) {
            throw new Error(`Missing ht:methodName in a ht:Request of ${uri}`);
        }
        if (!request.property.httpResponse) {
            throw new Error(`Missing ht:resp in a ht:Request of ${uri}`);
        }
        const response = request.property.httpResponse;
        const headers = [];
        for (const headerList of request.properties.httpHeaders) {
            for (const header of (_a = headerList.list) !== null && _a !== void 0 ? _a : []) {
                headers.push([header.property.httpFieldName.value, header.property.httpFieldValue.value]);
            }
        }
        const expectedStatusClasses = response.properties.expectedStatus
            .map((status) => {
            const match = STATUS_CODE_CLASS_REGEX.exec(status.value);
            if (!match) {
                throw new Error(`Unsupported mf:expectedStatus ${status.value} in ${uri}`);
            }
            return Number.parseInt(match[1], 10);
        });
        if (expectedStatusClasses.length === 0) {
            throw new Error(`Missing mf:expectedStatus in a ht:Response of ${uri}`);
        }
        return Object.assign(Object.assign(Object.assign(Object.assign({ absolutePath: request.property.httpAbsolutePath.value, method: request.property.httpMethodName.value, headers }, request.property.httpBody && {
            body: {
                chars: request.property.httpBody.property.contentChars.value,
                characterEncoding: request.property.httpBody.property.contentCharacterEncoding.value,
            },
        }), { expectedStatusClasses }), response.property.expectedFormat && { expectedFormat: response.property.expectedFormat.value }), response.property.expectedBoolean && {
            expectedBoolean: response.property.expectedBoolean.value === 'true',
        });
    }
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            const connection = resource.property.action;
            if (!connection.property.httpRequests) {
                throw new Error(`Missing ht:requests in mf:action of ${resource}`);
            }
            const requests = ((_a = connection.property.httpRequests.list) !== null && _a !== void 0 ? _a : [])
                .map(request => TestCaseProtocolHandler.getRequest(request, resource.value));
            if (requests.length === 0) {
                throw new Error(`Missing ht:Request entries in ht:requests of ${resource}`);
            }
            const graphDataLinks = TestCaseUpdateEvaluation_1.TestCaseUpdateEvaluationHandler.getQueryDataLinks(resource);
            return new TestCaseProtocol(testCaseData, {
                requests,
                graphData: yield TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler.resolveQueryDataLinks(graphDataLinks, options),
                graphDataLinks,
            });
        });
    }
}
exports.TestCaseProtocolHandler = TestCaseProtocolHandler;
class TestCaseProtocol {
    constructor(testCaseData, props) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
        Object.assign(this, props);
    }
    /**
     * Determine the endpoint that the protocol requests must be sent to.
     * @param injectArguments The custom engine options.
     */
    static getEndpoint(injectArguments) {
        const endpoint = injectArguments && injectArguments.protocolEndpoint;
        if (!endpoint) {
            throw new ErrorTest_1.ErrorTest('Protocol tests require an endpoint from startProtocolEndpoint or the protocolEndpoint option.');
        }
        return endpoint;
    }
    /**
     * Replace the manifest path prefix of the given request path with the path of the endpoint under test.
     * @param endpoint The endpoint under test.
     * @param absolutePath A ht:absolutePath value.
     */
    static resolveRequestUrl(endpoint, absolutePath) {
        if (!absolutePath.startsWith(MANIFEST_PATH_PREFIX)) {
            throw new ErrorTest_1.ErrorTest(`Expected the request path ${absolutePath} to start with ${MANIFEST_PATH_PREFIX}`);
        }
        return endpoint + absolutePath.slice(MANIFEST_PATH_PREFIX.length);
    }
    /**
     * Serialize the given quads into a SPARQL update that resets the endpoint to just those quads.
     * @param quads The quads to load, which must all be contained in a named graph.
     */
    static createLoadUpdate(quads) {
        const graphs = {};
        for (const quad of quads) {
            const graph = (0, rdf_string_ttl_1.termToString)(quad.graph);
            const triple = `${(0, rdf_string_ttl_1.termToString)(quad.subject)} ${(0, rdf_string_ttl_1.termToString)(quad.predicate)} ${(0, rdf_string_ttl_1.termToString)(quad.object)} .`;
            (graphs[graph] || (graphs[graph] = [])).push(triple);
        }
        const groups = Object.entries(graphs)
            .map(([graph, triples]) => `GRAPH ${graph} { ${triples.join('\n')} }`);
        return `DROP SILENT ALL ;\nINSERT DATA { ${groups.join('\n')} }`;
    }
    /**
     * Determine the class of the given HTTP status code, e.g. 2 for 204.
     * @param status An HTTP status code.
     */
    static statusClass(status) {
        return Math.floor(status / 100);
    }
    test(_engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = TestCaseProtocol.getEndpoint(injectArguments);
            if (this.graphData.length > 0) {
                yield this.loadGraphData(endpoint);
            }
            for (const request of this.requests) {
                yield this.testRequest(endpoint, request);
            }
        });
    }
    /**
     * Load the ut:graphData of this test case into the endpoint via a SPARQL update.
     * @param endpoint The endpoint under test.
     */
    loadGraphData(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(endpoint, {
                method: 'POST',
                headers: { 'content-type': 'application/sparql-update' },
                body: TestCaseProtocol.createLoadUpdate(this.graphData),
            });
            const body = yield response.text();
            if (!response.ok) {
                throw new ErrorTest_1.ErrorTest(`Could not load the test data into ${endpoint} (HTTP ${response.status}): ${body}`);
            }
        });
    }
    /**
     * Send a single request of this test case to the endpoint, and validate its response.
     * @param endpoint The endpoint under test.
     * @param request The request to send.
     */
    testRequest(endpoint, request) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const url = TestCaseProtocol.resolveRequestUrl(endpoint, request.absolutePath);
            let response;
            try {
                response = yield fetch(url, Object.assign({ method: request.method, headers: request.headers, redirect: 'manual' }, request.body && { body: TestCaseProtocol.encodeBody(request.body) }));
            }
            catch (error) {
                throw new ErrorTest_1.ErrorTest(`Could not send a ${request.method} request to ${url}: ${error.message}`);
            }
            const body = yield response.text();
            if (!request.expectedStatusClasses.includes(TestCaseProtocol.statusClass(response.status))) {
                throw new ErrorTest_1.ErrorTest(`Invalid response status for ${request.method} ${url}

  Expected one of: ${request.expectedStatusClasses.map(statusClass => `${statusClass}xx`).join(', ')}

  Got: ${response.status}\n\n${body}`);
            }
            const contentType = (_a = response.headers.get('content-type')) !== null && _a !== void 0 ? _a : '';
            if (request.expectedFormat) {
                TestCaseProtocol.validateFormat(request, url, contentType);
            }
            if (request.expectedBoolean !== undefined) {
                yield TestCaseProtocol.validateBoolean(request, url, contentType, body);
            }
        });
    }
    /**
     * Encode the body of a request in the character encoding that the manifest declares for it.
     * @param body A ht:body value.
     */
    static encodeBody(body) {
        const encoding = body.characterEncoding.toUpperCase();
        if (encoding === 'UTF-8') {
            return new TextEncoder().encode(body.chars).buffer;
        }
        if (encoding === 'UTF-16') {
            return new Uint8Array(Buffer.from(`\uFEFF${body.chars}`, 'utf16le')).buffer;
        }
        throw new ErrorTest_1.ErrorTest(`Unsupported cnt:characterEncoding ${body.characterEncoding}`);
    }
    /**
     * Validate that the content type of a response matches the format that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param contentType The content type of the response.
     */
    static validateFormat(request, url, contentType) {
        const contentTypes = EXPECTED_FORMAT_CONTENT_TYPES[request.expectedFormat];
        if (!contentTypes) {
            throw new ErrorTest_1.ErrorTest(`Unsupported mf:expectedFormat ${request.expectedFormat}`);
        }
        if (!contentTypes.some(expected => contentType.includes(expected))) {
            throw new ErrorTest_1.ErrorTest(`Invalid response content type for ${request.method} ${url}

  Expected a ${request.expectedFormat} format, which is one of: ${contentTypes.join(', ')}

  Got: ${contentType}`);
        }
    }
    /**
     * Validate that the body of a response contains the boolean result that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param contentType The content type of the response.
     * @param body The body of the response.
     */
    static validateBoolean(request, url, contentType, body) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            try {
                const parsed = yield TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler
                    .parseQueryResult(contentType, url, streamifyString(body));
                if (parsed.type !== 'boolean') {
                    throw new Error(`Expected a boolean result, but got a result of type ${parsed.type}`);
                }
                result = parsed;
            }
            catch (error) {
                throw new ErrorTest_1.ErrorTest(`Could not read a boolean result from the response of ${request.method} ${url}: ${error.message}\n\n${body}`);
            }
            if (result.value !== request.expectedBoolean) {
                throw new ErrorTest_1.ErrorTest(`Invalid boolean response for ${request.method} ${url}

  Expected: ${request.expectedBoolean}

  Got: ${result.value}`);
            }
        });
    }
}
exports.TestCaseProtocol = TestCaseProtocol;
//# sourceMappingURL=TestCaseProtocol.js.map