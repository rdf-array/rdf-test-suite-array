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
exports.TestCaseJsonLdFromRdfHandlerNegative = exports.TestCaseJsonLdFromRdfNegativeHandler = void 0;
const arrayify_stream_1 = require("arrayify-stream");
const rdf_string_1 = require("rdf-string");
const ErrorTest_1 = require("../../../ErrorTest");
const Util_1 = require("../../../Util");
const TestCaseJsonLdToRdf_1 = require("./TestCaseJsonLdToRdf");
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#FromRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#NegativeEvaluationTest
 */
class TestCaseJsonLdFromRdfNegativeHandler {
    resourceToTestCaseInner(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            if (!resource.property.result) {
                throw new Error(`Missing mf:result in ${resource}`);
            }
            return new TestCaseJsonLdFromRdfHandlerNegative(testCaseData, resource.property.result.value, yield (0, arrayify_stream_1.arrayifyStream)((yield Util_1.Util.fetchRdf(resource.property.action.value, Object.assign(Object.assign({}, options), { normalizeUrl: true })))[1]), resource.property.action.value, Object.assign(Object.assign({}, options), { normalizeUrl: true }));
        });
    }
    resourceToTestCase(resource, testCaseData, options) {
        return TestCaseJsonLdToRdf_1.TestCaseJsonLdToRdfHandler.wrap(this.resourceToTestCaseInner.bind(this), resource, testCaseData, options);
    }
}
exports.TestCaseJsonLdFromRdfNegativeHandler = TestCaseJsonLdFromRdfNegativeHandler;
class TestCaseJsonLdFromRdfHandlerNegative {
    constructor(testCaseData, expectErrorCode, data, baseIRI, options) {
        this.type = 'fromrdfsyntax';
        Object.assign(this, testCaseData);
        this.data = data;
        this.expectErrorCode = expectErrorCode;
        this.baseIRI = baseIRI;
        this.options = options;
    }
    test(serializer, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield serializer.serialize(this.data, this.baseIRI, Object.assign(Object.assign({}, this.options), injectArguments));
            }
            catch (e) {
                if (e.skipped) {
                    throw e;
                }
                this.validateError(e, injectArguments);
                return;
            }
            throw new ErrorTest_1.ErrorTest(`${this.getErrorMessage()}
  Input:
    ${this.data.map(quad => JSON.stringify((0, rdf_string_1.quadToStringQuad)(quad))).join(',\n    ')}
`);
        });
    }
    validateError(error, _injectArguments) {
        if (error.code !== this.expectErrorCode) {
            throw new Error(`Received invalid error code, expected ${this.expectErrorCode}, but got ${error.code} (${error.message})`);
        }
    }
    getErrorMessage() {
        return `Expected to throw an error with code '${this.expectErrorCode}' when parsing.`;
    }
}
exports.TestCaseJsonLdFromRdfHandlerNegative = TestCaseJsonLdFromRdfHandlerNegative;
//# sourceMappingURL=TestCaseJsonLdFromRdfNegative.js.map