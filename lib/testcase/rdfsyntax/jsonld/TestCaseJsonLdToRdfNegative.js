"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseJsonLdToRdfHandlerNegative = exports.TestCaseJsonLdToRdfNegativeHandler = void 0;
const TestCaseSyntax_1 = require("../TestCaseSyntax");
const TestCaseJsonLdToRdf_1 = require("./TestCaseJsonLdToRdf");
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#NegativeEvaluationTest
 */
class TestCaseJsonLdToRdfNegativeHandler extends TestCaseSyntax_1.TestCaseSyntaxHandler {
    constructor() {
        super(false);
    }
    resourceToTestCase(resource, testCaseData, options) {
        return TestCaseJsonLdToRdf_1.TestCaseJsonLdToRdfHandler.wrap(super.resourceToTestCase.bind(this), resource, testCaseData, options);
    }
    normalizeUrl(url) {
        return url;
    }
    getTestCaseClass() {
        return TestCaseJsonLdToRdfHandlerNegative;
    }
}
exports.TestCaseJsonLdToRdfNegativeHandler = TestCaseJsonLdToRdfNegativeHandler;
class TestCaseJsonLdToRdfHandlerNegative extends TestCaseSyntax_1.TestCaseSyntax {
    constructor(testCaseData, expectError, data, baseIRI) {
        super(testCaseData, expectError, data, baseIRI);
        if (!this.expectErrorCode) {
            throw new Error('Invalid test case definition, no expected error code was defined.');
        }
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
exports.TestCaseJsonLdToRdfHandlerNegative = TestCaseJsonLdToRdfHandlerNegative;
//# sourceMappingURL=TestCaseJsonLdToRdfNegative.js.map