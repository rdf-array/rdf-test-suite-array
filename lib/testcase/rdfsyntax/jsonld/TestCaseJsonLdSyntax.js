"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseJsonLdSyntaxHandler = void 0;
const TestCaseSyntax_1 = require("../TestCaseSyntax");
const TestCaseJsonLdToRdf_1 = require("./TestCaseJsonLdToRdf");
/**
 * Test case handler for:
 * * https://json-ld.org/test-suite/vocab#NegativeEvaluationTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#PositiveSyntaxTest
 */
class TestCaseJsonLdSyntaxHandler extends TestCaseSyntax_1.TestCaseSyntaxHandler {
    constructor(expectNoError) {
        super(expectNoError);
    }
    resourceToTestCase(resource, testCaseData, options) {
        return TestCaseJsonLdToRdf_1.TestCaseJsonLdToRdfHandler.wrap(super.resourceToTestCase.bind(this), resource, testCaseData, options);
    }
    normalizeUrl(url) {
        return url;
    }
}
exports.TestCaseJsonLdSyntaxHandler = TestCaseJsonLdSyntaxHandler;
//# sourceMappingURL=TestCaseJsonLdSyntax.js.map