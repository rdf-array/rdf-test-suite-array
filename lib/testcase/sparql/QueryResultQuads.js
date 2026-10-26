"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResultQuads = void 0;
const rdf_string_1 = require("rdf-string");
const Sequences_1 = require("../../Sequences");
/**
 * Holds quad-based query results.
 */
class QueryResultQuads {
    constructor(value) {
        this.type = 'quads';
        this.value = value;
    }
    equals(that) {
        if (that.type !== 'quads') {
            return false;
        }
        return (0, Sequences_1.isomorphic)(this.value, that.value);
    }
    toString() {
        return `[QueryResultQuads: ${JSON.stringify(this.value.map(rdf_string_1.quadToStringQuad), null, '  ')}]`;
    }
}
exports.QueryResultQuads = QueryResultQuads;
//# sourceMappingURL=QueryResultQuads.js.map