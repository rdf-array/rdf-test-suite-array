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
exports.TestCaseServiceDescription = exports.TestCaseServiceDescriptionHandler = void 0;
const arrayify_stream_1 = require("arrayify-stream");
const ErrorTest_1 = require("../../ErrorTest");
const Util_1 = require("../../Util");
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const SD = 'http://www.w3.org/ns/sparql-service-description#';
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#ServiceDescriptionTest.
 */
class TestCaseServiceDescriptionHandler {
    resourceToTestCase(_resource, testCaseData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new TestCaseServiceDescription(testCaseData);
        });
    }
}
exports.TestCaseServiceDescriptionHandler = TestCaseServiceDescriptionHandler;
class TestCaseServiceDescription {
    constructor(testCaseData) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
    }
    test(_engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = TestCaseServiceDescription.getEndpoint(injectArguments);
            switch (this.name) {
                case 'GET on endpoint returns RDF':
                    yield TestCaseServiceDescription.getServiceDescription(endpoint);
                    return;
                case 'Service description contains a matching sd:endpoint triple': {
                    const serviceDescription = yield TestCaseServiceDescription.getServiceDescription(endpoint);
                    if (!serviceDescription.some(quad => quad.predicate.value === `${SD}endpoint` &&
                        quad.object.termType === 'NamedNode' && quad.object.value === endpoint)) {
                        throw new ErrorTest_1.ErrorTest(`Service description at ${endpoint} does not contain a matching sd:endpoint triple.`);
                    }
                    return;
                }
                case 'Service description conforms to schema': {
                    const serviceDescription = yield TestCaseServiceDescription.getServiceDescription(endpoint);
                    TestCaseServiceDescription.validateSchema(serviceDescription, endpoint);
                    return;
                }
                default:
                    throw new ErrorTest_1.ErrorTest(`Unsupported SPARQL service-description test: ${this.name}`);
            }
        });
    }
    static getEndpoint(injectArguments) {
        const endpoint = injectArguments && injectArguments.serviceDescriptionEndpoint;
        if (!endpoint) {
            throw new ErrorTest_1.ErrorTest('Service-description tests require an endpoint from startServiceDescriptionEndpoint or the serviceDescriptionEndpoint option.');
        }
        try {
            const url = new URL(endpoint);
            if (url.search || url.hash) {
                throw new Error('The endpoint URL must not contain query parameters or a fragment');
            }
        }
        catch (error) {
            throw new ErrorTest_1.ErrorTest(`Invalid serviceDescriptionEndpoint: ${error.message}`);
        }
        return endpoint;
    }
    static getServiceDescription(endpoint) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield Util_1.Util.fetchCached(endpoint, {}, {
                    headers: {
                        accept: 'text/turtle, application/rdf+xml;q=0.9, application/ld+json;q=0.8',
                    },
                    method: 'GET',
                });
                const contentType = Util_1.Util.identifyContentType(response.url, response.headers);
                return yield (0, arrayify_stream_1.arrayifyStream)(Util_1.Util.parseRdfRaw(contentType, endpoint, response.body));
            }
            catch (error) {
                throw new ErrorTest_1.ErrorTest(`Could not retrieve an RDF service description from ${endpoint}: ${error.message}`);
            }
        });
    }
    static validateSchema(serviceDescription, endpoint) {
        const namedGraphs = new Set();
        const namedGraphsWithName = new Set();
        const datasets = new Set();
        const datasetsWithDefaultGraph = new Set();
        for (const quad of serviceDescription) {
            const subject = TestCaseServiceDescription.termKey(quad.subject);
            if (quad.predicate.value === `${SD}endpoint` && quad.object.termType !== 'NamedNode') {
                throw new ErrorTest_1.ErrorTest(`The sd:endpoint value in the service description at ${endpoint} must be an IRI.`);
            }
            if (quad.predicate.value === `${SD}name`) {
                if (quad.object.termType !== 'NamedNode') {
                    throw new ErrorTest_1.ErrorTest(`The sd:name value in the service description at ${endpoint} must be an IRI.`);
                }
                namedGraphsWithName.add(subject);
            }
            if (quad.predicate.value === `${SD}namedGraph`) {
                namedGraphs.add(TestCaseServiceDescription.termKey(quad.object));
            }
            if (quad.predicate.value === `${SD}defaultGraph`) {
                datasetsWithDefaultGraph.add(subject);
            }
            if (quad.predicate.value === RDF_TYPE && quad.object.value === `${SD}NamedGraph`) {
                namedGraphs.add(subject);
            }
            if (quad.predicate.value === RDF_TYPE && quad.object.value === `${SD}Dataset`) {
                datasets.add(subject);
            }
        }
        for (const namedGraph of namedGraphs) {
            if (!namedGraphsWithName.has(namedGraph)) {
                throw new ErrorTest_1.ErrorTest(`Each sd:NamedGraph in the service description at ${endpoint} must have an sd:name.`);
            }
        }
        for (const dataset of datasets) {
            if (!datasetsWithDefaultGraph.has(dataset)) {
                throw new ErrorTest_1.ErrorTest(`Each sd:Dataset in the service description at ${endpoint} must have an sd:defaultGraph.`);
            }
        }
    }
    static termKey(term) {
        return `${term.termType}:${term.value}`;
    }
}
exports.TestCaseServiceDescription = TestCaseServiceDescription;
//# sourceMappingURL=TestCaseServiceDescription.js.map