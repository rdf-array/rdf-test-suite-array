"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryResultBindings = void 0;
const rdf_literal_1 = require("rdf-literal");
const rdf_string_1 = require("rdf-string");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringify = require('json-stable-stringify');
/**
 * Holds bindings-based query results.
 */
class QueryResultBindings {
    constructor(variables, value, checkOrder) {
        this.type = 'bindings';
        this.variables = variables;
        this.value = value;
        this.checkOrder = checkOrder;
    }
    static serializeTerm(term, blankNodeCounters) {
        // Rdf-array: a sequence is compared element by element, its blank nodes normalized like any other
        if (term.termType === 'Sequence') {
            return `(${term.elements
                .map(element => JSON.stringify(QueryResultBindings.serializeTerm(element, blankNodeCounters)))
                .join(' ')})`;
        }
        switch (term.termType) {
            case 'Literal':
                return (0, rdf_literal_1.fromRdf)(term);
            case 'BlankNode': {
                if (!(term.value in blankNodeCounters)) {
                    blankNodeCounters[term.value] = Object.keys(blankNodeCounters).length;
                }
                const blankNodeCounter = blankNodeCounters[term.value];
                return `_:${blankNodeCounter}`;
            }
            case 'Quad':
                return `<<${QueryResultBindings.serializeTerm(term.subject, blankNodeCounters)} ${QueryResultBindings.serializeTerm(term.predicate, blankNodeCounters)} ${QueryResultBindings.serializeTerm(term.object, blankNodeCounters)} ${QueryResultBindings.serializeTerm(term.graph, blankNodeCounters)}>>`;
            default:
                return (0, rdf_string_1.termToString)(term);
        }
    }
    static hashBinding(binding, blankNodeCounters) {
        const bHash = {};
        for (const variable of Object.keys(binding).sort()) {
            bHash[variable] = QueryResultBindings.serializeTerm(binding[variable], blankNodeCounters);
        }
        return stringify(bHash);
    }
    static hashBindings(bindings, blankNodeCounters, checkOrder) {
        const hash = [];
        if (!checkOrder) {
            // Sort *before* we normalize blank nodes, otherwise isomorphic bindings may end up being sorted differently.
            // We do this sorting using fresh blank node counters for each binding.
            bindings = bindings.sort((binding1, binding2) => QueryResultBindings.hashBinding(binding1, {})
                .localeCompare(QueryResultBindings.hashBinding(binding2, {})));
        }
        for (const b of bindings) {
            hash.push(QueryResultBindings.hashBinding(b, blankNodeCounters));
        }
        return hash.join('');
    }
    static hashBindingsCount(bindings, blankNodeCounters) {
        const hash = {};
        for (const b of bindings) {
            const bHash = {};
            for (const variable of Object.keys(b).sort()) {
                bHash[variable] = QueryResultBindings.serializeTerm(b[variable], blankNodeCounters);
            }
            const bString = JSON.stringify(bHash);
            if (hash[bString]) {
                hash[bString]++;
            }
            else {
                hash[bString] = 1;
            }
        }
        return hash;
    }
    equals(that, laxCardinality) {
        if (that.type !== 'bindings') {
            return false;
        }
        if ((this.value.length > 0 || that.value.length > 0) &&
            JSON.stringify(this.variables.sort()) !== JSON.stringify(that.variables.sort())) {
            return false;
        }
        if (laxCardinality) {
            // This is applicable for REDUCED.
            // The actual results can contain duplicates.
            // The expected results contains the upper limit of how many duplicates there can be. The lower limit is 1.
            const countedBindingsExpected = QueryResultBindings.hashBindingsCount(this.value, {});
            const countedBindingsActual = QueryResultBindings.hashBindingsCount(that.value, {});
            if (Object.keys(countedBindingsExpected).sort().join(',') !== Object.keys(countedBindingsActual).sort().join(',')) {
                // The fully distinct keys are not equal
                return false;
            }
            // At this point, the keys are equal, so we check if the actual count is not more than the expected count
            for (const key in countedBindingsActual) {
                if (countedBindingsActual[key] > countedBindingsExpected[key]) {
                    // The actual value contains *more* occurrences for this binding than allowed
                    return false;
                }
            }
            return true;
        }
        return QueryResultBindings.hashBindings(this.value, {}, this.checkOrder) ===
            QueryResultBindings.hashBindings(that.value, {}, that.checkOrder);
    }
    toString() {
        return `[QueryResultBindings:
    Variables: ${JSON.stringify(this.variables, null, '  ')}
    Bindings:  ${JSON.stringify(this.value, null, '  ')}
]`;
    }
}
exports.QueryResultBindings = QueryResultBindings;
//# sourceMappingURL=QueryResultBindings.js.map