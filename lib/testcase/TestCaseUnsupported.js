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
exports.TestCaseUnsupported = exports.TestCaseUnsupportedHandler = void 0;
const ErrorSkipped_1 = require("../ErrorSkipped");
/**
 * A fallback test case handler that constructs unsupported test cases.
 */
class TestCaseUnsupportedHandler {
    constructor(name) {
        this.name = name;
    }
    resourceToTestCase(resource, testCaseData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new TestCaseUnsupported(this.name, testCaseData);
        });
    }
}
exports.TestCaseUnsupportedHandler = TestCaseUnsupportedHandler;
class TestCaseUnsupported {
    constructor(testCaseName, testCaseData) {
        this.type = 'unsupported';
        this.testCaseName = testCaseName;
        Object.assign(this, testCaseData);
    }
    test(_engine) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new ErrorSkipped_1.ErrorSkipped(`Unsupported test case ${this.testCaseName}`);
        });
    }
}
exports.TestCaseUnsupported = TestCaseUnsupported;
//# sourceMappingURL=TestCaseUnsupported.js.map