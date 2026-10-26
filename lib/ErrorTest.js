"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTest = void 0;
/**
 * Error to indicate that this is a test failure.
 */
class ErrorTest extends Error {
    constructor(message) {
        super(message);
        this.test = true;
    }
}
exports.ErrorTest = ErrorTest;
//# sourceMappingURL=ErrorTest.js.map