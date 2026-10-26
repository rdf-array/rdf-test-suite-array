"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorSkipped = void 0;
/**
 * An error to indicate if a test should be skipped.
 */
class ErrorSkipped extends Error {
    constructor(message) {
        super(message);
        this.skipped = true;
    }
}
exports.ErrorSkipped = ErrorSkipped;
//# sourceMappingURL=ErrorSkipped.js.map