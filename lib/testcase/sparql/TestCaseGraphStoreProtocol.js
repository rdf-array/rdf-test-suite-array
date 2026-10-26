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
exports.TestCaseGraphStoreProtocol = exports.TestCaseGraphStoreProtocolHandler = void 0;
const arrayify_stream_1 = require("arrayify-stream");
const ErrorSkipped_1 = require("../../ErrorSkipped");
const ErrorTest_1 = require("../../ErrorTest");
const Sequences_1 = require("../../Sequences");
const Util_1 = require("../../Util");
const TestCaseProtocol_1 = require("./TestCaseProtocol");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const streamifyString = require('streamify-string');
const MF = 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#';
/**
 * The path prefix that every ht:absolutePath in the SPARQL 1.1 Graph Store Protocol manifest starts with.
 * It is replaced by the path of the graph store endpoint under test.
 */
const MANIFEST_PATH_PREFIX = '/gsp';
const STATUS_CODE_CLASS_REGEX = /^http:\/\/www\.w3\.org\/2011\/http-statusCodes#StatusCode(\d)xx$/u;
const STATUS_CODE_PREFIX = 'http://www.w3.org/2011/http-statusCodes#';
/**
 * The status codes of the HTTP status codes vocabulary that the manifests refer to by name.
 */
const STATUS_CODES = {
    OK: 200,
    Created: 201,
    NoContent: 204,
    NotFound: 404,
};
/**
 * The features that an endpoint must support for a test to be applicable,
 * as expressed through mf:requires in the manifest.
 */
const KNOWN_FEATURES = new Set([
    `${MF}DirectGraphIdentification`,
    `${MF}IndirectGraphIdentification`,
    `${MF}POSTGraphCreation`,
]);
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#GraphStoreProtocolTest.
 */
class TestCaseGraphStoreProtocolHandler {
    /**
     * Interpret the ht:headers of a ht:Request or ht:Response.
     * @param resource A ht:Request or ht:Response resource.
     */
    static getHeaders(resource) {
        var _a;
        const headers = [];
        for (const headerList of resource.properties.httpHeaders) {
            for (const header of (_a = headerList.list) !== null && _a !== void 0 ? _a : []) {
                headers.push([header.property.httpFieldName.value, header.property.httpFieldValue.value]);
            }
        }
        return headers;
    }
    /**
     * Interpret a cnt:ContentAsText resource.
     * @param content A cnt:ContentAsText resource.
     */
    static getContent(content) {
        return {
            chars: content.property.contentChars.value,
            characterEncoding: content.property.contentCharacterEncoding.value,
        };
    }
    /**
     * Interpret a mf:expectedStatus value as either a concrete status code or a status code class.
     * @param status A mf:expectedStatus value.
     * @param uri The URI of the test case the status belongs to, used for error reporting.
     */
    static getExpectedStatus(status, uri) {
        const classMatch = STATUS_CODE_CLASS_REGEX.exec(status);
        if (classMatch) {
            return { statusClass: Number.parseInt(classMatch[1], 10) };
        }
        if (status.startsWith(STATUS_CODE_PREFIX)) {
            const code = STATUS_CODES[status.slice(STATUS_CODE_PREFIX.length)];
            if (code) {
                return { status: code };
            }
        }
        throw new Error(`Unsupported mf:expectedStatus ${status} in ${uri}`);
    }
    /**
     * Interpret a single ht:Request resource, together with the ht:Response it is expected to produce.
     * @param request A ht:Request resource.
     * @param uri The URI of the test case the request belongs to, used for error reporting.
     */
    static getRequest(request, uri) {
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
        const expectedStatuses = [];
        const expectedStatusClasses = [];
        for (const expected of response.properties.expectedStatus) {
            const { status, statusClass } = TestCaseGraphStoreProtocolHandler.getExpectedStatus(expected.value, uri);
            if (status === undefined) {
                expectedStatusClasses.push(statusClass);
            }
            else {
                expectedStatuses.push(status);
            }
        }
        if (expectedStatuses.length === 0 && expectedStatusClasses.length === 0) {
            throw new Error(`Missing mf:expectedStatus in a ht:Response of ${uri}`);
        }
        return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ absolutePath: request.property.httpAbsolutePath.value, method: request.property.httpMethodName.value, headers: TestCaseGraphStoreProtocolHandler.getHeaders(request) }, request.property.httpBody && {
            body: TestCaseGraphStoreProtocolHandler.getContent(request.property.httpBody),
        }), { expectedStatuses,
            expectedStatusClasses }), response.property.expectedLocation && { expectedLocation: response.property.expectedLocation.value }), { expectedHeaders: TestCaseGraphStoreProtocolHandler.getHeaders(response) }), response.property.httpBody && {
            expectedBody: TestCaseGraphStoreProtocolHandler.getContent(response.property.httpBody),
        });
    }
    resourceToTestCase(resource, testCaseData) {
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
                .map(request => TestCaseGraphStoreProtocolHandler.getRequest(request, resource.value));
            if (requests.length === 0) {
                throw new Error(`Missing ht:Request entries in ht:requests of ${resource}`);
            }
            return new TestCaseGraphStoreProtocol(testCaseData, {
                requests,
                requiredFeatures: resource.properties.requires.map(feature => feature.value),
            });
        });
    }
}
exports.TestCaseGraphStoreProtocolHandler = TestCaseGraphStoreProtocolHandler;
class TestCaseGraphStoreProtocol {
    constructor(testCaseData, props) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
        Object.assign(this, props);
    }
    /**
     * Determine the endpoint that the graph store protocol requests must be sent to.
     * @param injectArguments The custom engine options.
     */
    static getEndpoint(injectArguments) {
        const endpoint = injectArguments && injectArguments.graphStoreEndpoint;
        if (!endpoint) {
            throw new ErrorTest_1.ErrorTest('Graph store protocol tests require an endpoint from startGraphStoreEndpoint or the graphStoreEndpoint option.');
        }
        return endpoint;
    }
    /**
     * Replace the manifest path prefix of the given request path with the path of the endpoint under test.
     * @param endpoint The endpoint under test.
     * @param absolutePath A ht:absolutePath value.
     */
    static resolveRequestUrl(endpoint, absolutePath) {
        const suffix = absolutePath.slice(MANIFEST_PATH_PREFIX.length);
        if (!absolutePath.startsWith(MANIFEST_PATH_PREFIX) || (suffix && !suffix.startsWith('/') && !suffix.startsWith('?'))) {
            throw new ErrorTest_1.ErrorTest(`Expected the request path ${absolutePath} to start with ${MANIFEST_PATH_PREFIX}`);
        }
        return endpoint + suffix;
    }
    /**
     * Determine the class of the given HTTP status code, e.g. 2 for 204.
     * @param status An HTTP status code.
     */
    static statusClass(status) {
        return Math.floor(status / 100);
    }
    /**
     * Determine the media type of a content type header value, without any of its parameters.
     * @param contentType A content type header value.
     */
    static mediaType(contentType) {
        return contentType.split(';')[0].trim().toLowerCase();
    }
    /**
     * Replace all template variables in the given string with the values they have been bound to.
     * @param value The string to fill the template variables in.
     * @param templates The values of the template variables, indexed by variable.
     */
    static fillTemplates(value, templates) {
        return Object.entries(templates)
            .reduce((filled, [variable, binding]) => filled.split(variable).join(binding), value);
    }
    test(_engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const unsupported = this.requiredFeatures.filter(feature => !KNOWN_FEATURES.has(feature));
            if (unsupported.length > 0) {
                throw new ErrorSkipped_1.ErrorSkipped(`Unsupported graph store protocol features: ${unsupported.join(', ')}`);
            }
            const endpoint = TestCaseGraphStoreProtocol.getEndpoint(injectArguments);
            yield this.clearGraphs(endpoint);
            const templates = {};
            for (const request of this.requests) {
                yield this.testRequest(endpoint, request, templates);
            }
        });
    }
    /**
     * Delete every graph that this test case addresses, so that it starts from a known state.
     * The responses are ignored, as the graphs are not required to exist.
     * @param endpoint The endpoint under test.
     */
    clearGraphs(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            const variables = this.requests
                .map(request => request.expectedLocation)
                .filter((variable) => variable !== undefined);
            const paths = new Set(this.requests
                .map(request => request.absolutePath)
                .filter(absolutePath => absolutePath !== MANIFEST_PATH_PREFIX)
                .filter(absolutePath => !variables.some(variable => absolutePath.includes(variable))));
            for (const absolutePath of paths) {
                const url = TestCaseGraphStoreProtocol.resolveRequestUrl(endpoint, absolutePath);
                try {
                    yield fetch(url, { method: 'DELETE' });
                }
                catch (_a) {
                    // The graphs are cleared on a best-effort basis, failures are reported by the test requests themselves
                }
            }
        });
    }
    /**
     * Send a single request of this test case to the endpoint, and validate its response.
     * @param endpoint The endpoint under test.
     * @param request The request to send.
     * @param templates The template variables bound by the previous requests, extended by this request.
     */
    testRequest(endpoint, request, templates) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = TestCaseGraphStoreProtocol
                .resolveRequestUrl(endpoint, TestCaseGraphStoreProtocol.fillTemplates(request.absolutePath, templates));
            let response;
            try {
                response = yield fetch(url, Object.assign({ method: request.method, headers: request.headers, redirect: 'manual' }, request.body && {
                    body: TestCaseProtocol_1.TestCaseProtocol.encodeBody(Object.assign(Object.assign({}, request.body), { chars: TestCaseGraphStoreProtocol.fillTemplates(request.body.chars, templates) })),
                }));
            }
            catch (error) {
                throw new ErrorTest_1.ErrorTest(`Could not send a ${request.method} request to ${url}: ${error.message}`);
            }
            const body = yield response.text();
            this.validateStatus(request, url, response.status, body);
            if (request.expectedLocation) {
                templates[request.expectedLocation] = TestCaseGraphStoreProtocol
                    .getLocation(request, url, response);
            }
            TestCaseGraphStoreProtocol.validateHeaders(request, url, response);
            if (request.expectedBody) {
                yield TestCaseGraphStoreProtocol.validateBody(request, url, response, body);
            }
        });
    }
    /**
     * Validate that the status of a response is one of the statuses that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param status The status of the response.
     * @param body The body of the response.
     */
    validateStatus(request, url, status, body) {
        if (request.expectedStatuses.includes(status) ||
            request.expectedStatusClasses.includes(TestCaseGraphStoreProtocol.statusClass(status))) {
            return;
        }
        const expected = [
            ...request.expectedStatuses.map(String),
            ...request.expectedStatusClasses.map(statusClass => `${statusClass}xx`),
        ];
        throw new ErrorTest_1.ErrorTest(`Invalid response status for ${request.method} ${url}

  Expected one of: ${expected.join(', ')}

  Got: ${status}\n\n${body}`);
    }
    /**
     * Determine the location that a response points to, which subsequent requests in this test case refer to.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param response The response that was received.
     */
    static getLocation(request, url, response) {
        const location = response.headers.get('location');
        if (!location) {
            throw new ErrorTest_1.ErrorTest(`Missing Location response header for ${request.method} ${url}`);
        }
        return new URL(location, url).href;
    }
    /**
     * Validate that the headers of a response match the headers that the manifest expects.
     * Content type parameters such as the character encoding are not compared.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param response The response that was received.
     */
    static validateHeaders(request, url, response) {
        for (const [name, value] of request.expectedHeaders) {
            const actual = response.headers.get(name);
            const equal = name.toLowerCase() === 'content-type' && actual ?
                TestCaseGraphStoreProtocol.mediaType(actual) === TestCaseGraphStoreProtocol.mediaType(value) :
                actual === value;
            if (!equal) {
                throw new ErrorTest_1.ErrorTest(`Invalid ${name} response header for ${request.method} ${url}

  Expected: ${value}

  Got: ${actual}`);
            }
        }
    }
    /**
     * Validate that the body of a response is isomorphic to the graph that the manifest expects.
     * @param request The request that was sent.
     * @param url The URL the request was sent to.
     * @param response The response that was received.
     * @param body The body of the response.
     */
    static validateBody(request, url, response, body) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const expectedContentType = (_b = (_a = request.expectedHeaders
                .find(([name]) => name.toLowerCase() === 'content-type')) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : '';
            const expected = yield TestCaseGraphStoreProtocol
                .parseBody(expectedContentType, url, request.expectedBody.chars, 'expected');
            const actual = yield TestCaseGraphStoreProtocol
                .parseBody((_c = response.headers.get('content-type')) !== null && _c !== void 0 ? _c : '', url, body, 'actual');
            if (!(0, Sequences_1.isomorphic)(expected, actual)) {
                throw new ErrorTest_1.ErrorTest(`Invalid response body for ${request.method} ${url}

  Expected: ${request.expectedBody.chars}

  Got: ${body}`);
            }
        });
    }
    /**
     * Parse an RDF graph that was sent over HTTP.
     * @param contentType The content type the graph is serialized in.
     * @param url The URL that the graph is a representation of, which relative IRIs are resolved against.
     * @param body The serialized graph.
     * @param label The kind of body that is being parsed, used for error reporting.
     */
    static parseBody(contentType, url, body, label) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (0, arrayify_stream_1.arrayifyStream)(Util_1.Util.parseRdfRaw(contentType, url, streamifyString(body)));
            }
            catch (error) {
                throw new ErrorTest_1.ErrorTest(`Could not parse the ${label} response body of ${url}: ${error.message}\n\n${body}`);
            }
        });
    }
}
exports.TestCaseGraphStoreProtocol = TestCaseGraphStoreProtocol;
//# sourceMappingURL=TestCaseGraphStoreProtocol.js.map