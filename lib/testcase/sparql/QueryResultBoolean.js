"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResultBoolean = void 0;
/**
 * Holds a boolean query result.
 */
class QueryResultBoolean {
    constructor(value) {
        this.type = 'boolean';
        this.value = value;
    }
    equals(that) {
        return that.type === 'boolean' && that.value === this.value;
    }
    toString() {
        return `[QueryResultBoolean: ${this.value}]`;
    }
}
exports.QueryResultBoolean = QueryResultBoolean;
//# sourceMappingURL=QueryResultBoolean.js.map