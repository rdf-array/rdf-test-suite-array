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
exports.TestCaseSyntax = exports.TestCaseSyntaxHandler = void 0;
const ErrorTest_1 = require("../../ErrorTest");
const Util_1 = require("../../Util");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
/**
 * Test case handler for checking if a syntax is valid or not.
 */
class TestCaseSyntaxHandler {
    constructor(expectNoError) {
        this.expectNoError = expectNoError;
    }
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            return new (this.getTestCaseClass())(testCaseData, this.expectNoError, yield stringifyStream((yield Util_1.Util.fetchCached(resource.property.action.value, options)).body), this.normalizeUrl(resource.property.action.value));
        });
    }
    getTestCaseClass() {
        return TestCaseSyntax;
    }
    normalizeUrl(url) {
        return Util_1.Util.normalizeBaseUrl(url);
    }
}
exports.TestCaseSyntaxHandler = TestCaseSyntaxHandler;
class TestCaseSyntax {
    constructor(testCaseData, expectError, data, baseIRI) {
        this.type = 'rdfsyntax';
        Object.assign(this, testCaseData);
        this.expectNoError = expectError;
        this.data = data;
        this.baseIRI = baseIRI;
    }
    test(parser, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield parser.parse(this.data, this.baseIRI, injectArguments, this);
            }
            catch (e) {
                if (e.skipped) {
                    throw e;
                }
                if (this.expectNoError) {
                    throw new ErrorTest_1.ErrorTest(`Expected not throw an error when parsing.
  Input: ${this.data}
  Error: ${e}
`);
                }
                this.validateError(e, injectArguments);
                return;
            }
            if (!this.expectNoError) {
                throw new ErrorTest_1.ErrorTest(`${this.getErrorMessage()}
  Input: ${this.data}
`);
            }
        });
    }
    validateError(_error, _injectArguments) {
        // Overridable
    }
    getErrorMessage() {
        return 'Expected to throw an error when parsing.';
    }
}
exports.TestCaseSyntax = TestCaseSyntax;
//# sourceMappingURL=TestCaseSyntax.js.map