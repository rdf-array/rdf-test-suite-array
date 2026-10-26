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
exports.TestCasePositiveSyntax = exports.TestCasePositiveSyntaxHandler = void 0;
const ErrorTest_1 = require("../../ErrorTest");
const Util_1 = require("../../Util");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#PositiveSyntaxTest.
 */
class TestCasePositiveSyntaxHandler {
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource.term.value}`);
            }
            return new TestCasePositiveSyntax(testCaseData, yield stringifyStream((yield Util_1.Util.fetchCached(resource.property.action.value, options)).body), Util_1.Util.normalizeBaseUrl(resource.property.action.value));
        });
    }
}
exports.TestCasePositiveSyntaxHandler = TestCasePositiveSyntaxHandler;
class TestCasePositiveSyntax {
    constructor(testCaseData, queryString, baseIRI) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
        this.queryString = queryString;
        this.baseIRI = baseIRI;
    }
    test(engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield engine.parse(this.queryString, Object.assign({ baseIRI: this.baseIRI }, injectArguments));
            }
            catch (e) {
                throw new ErrorTest_1.ErrorTest(`Expected not throw an error when parsing.
  Input: ${this.queryString}
  Error: ${e}
`);
            }
        });
    }
}
exports.TestCasePositiveSyntax = TestCasePositiveSyntax;
//# sourceMappingURL=TestCasePositiveSyntax.js.map