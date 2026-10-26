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
exports.TestCaseJsonLdFromRdf = exports.TestCaseJsonLdFromRdfHandler = void 0;
exports.objectsIsomorphic = objectsIsomorphic;
exports.arraySorter = arraySorter;
const arrayify_stream_1 = require("arrayify-stream");
const rdf_string_1 = require("rdf-string");
const Util_1 = require("../../../Util");
const TestCaseJsonLdToRdf_1 = require("./TestCaseJsonLdToRdf");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#FromRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#PositiveEvaluationTest
 *
 * It will check if the serialization from RDF to JSON-LD matches with the expected JSON-LD document.
 */
class TestCaseJsonLdFromRdfHandler {
    resourceToTestCaseInner(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            if (!resource.property.result) {
                throw new Error(`Missing mf:result in ${resource}`);
            }
            return new TestCaseJsonLdFromRdf(testCaseData, yield (0, arrayify_stream_1.arrayifyStream)((yield Util_1.Util.fetchRdf(resource.property.action.value, Object.assign(Object.assign({}, options), { normalizeUrl: true })))[1]), yield stringifyStream((yield Util_1.Util.fetchCached(resource.property.result.value, options)).body), resource.property.action.value, Object.assign(Object.assign({}, options), { normalizeUrl: true }));
        });
    }
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            return TestCaseJsonLdToRdf_1.TestCaseJsonLdToRdfHandler.wrap(this.resourceToTestCaseInner.bind(this), resource, testCaseData, options);
        });
    }
}
exports.TestCaseJsonLdFromRdfHandler = TestCaseJsonLdFromRdfHandler;
class TestCaseJsonLdFromRdf {
    constructor(testCaseData, data, expected, baseIRI, options) {
        this.type = 'fromrdfsyntax';
        Object.assign(this, testCaseData);
        this.data = data;
        this.expected = expected;
        this.baseIRI = baseIRI;
        this.options = options;
    }
    test(serializer, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const serialized = yield serializer.serialize(this.data, this.baseIRI, Object.assign(Object.assign({}, this.options), injectArguments));
            if (!objectsIsomorphic(JSON.parse(serialized), JSON.parse(this.expected))) {
                throw new Error(`Invalid data serialization
  Input:
    ${this.data.map(quad => JSON.stringify((0, rdf_string_1.quadToStringQuad)(quad))).join(',\n    ')}

  Expected: ${this.expected}

  Got: ${serialized}
`);
            }
        });
    }
}
exports.TestCaseJsonLdFromRdf = TestCaseJsonLdFromRdf;
// eslint-disable-next-line unicorn/no-object-as-default-parameter
function objectsIsomorphic(obj1, obj2, options = {
    ordered: false,
    strictBlankNodes: false,
}, parentKey) {
    if (parentKey !== '@list' && !options.ordered && Array.isArray(obj1) && Array.isArray(obj2)) {
        obj1 = obj1.sort(arraySorter);
        obj2 = obj2.sort(arraySorter);
    }
    // Loop through properties in object 1
    for (const p in obj1) {
        // Check property exists on obj2
        if (!(p in obj2)) {
            return false;
        }
        switch (typeof (obj1[p])) {
            case 'object':
                if (typeof obj2[p] !== 'object' || !objectsIsomorphic(obj1[p], obj2[p], options, p)) {
                    return false;
                }
                break;
            case 'string':
                // Don't match blank nodes strictly
                if (!options.strictBlankNodes && obj1[p].startsWith('_:') &&
                    typeof obj2[p] === 'string' && obj2[p].startsWith('_:')) {
                    return true;
                }
            // Compare values
            // falls through
            default:
                if (obj1[p] !== obj2[p]) {
                    return false;
                }
        }
    }
    // Check object 2 for any extra properties
    for (const p in obj2) {
        if (!(p in obj1)) {
            return false;
        }
    }
    return true;
}
function arraySorter(obj1, obj2) {
    return JSON.stringify(obj1).localeCompare(JSON.stringify(obj2));
}
//# sourceMappingURL=TestCaseJsonLdFromRdf.js.map