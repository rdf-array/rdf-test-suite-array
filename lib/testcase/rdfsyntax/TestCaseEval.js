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
exports.TestCaseEval = exports.TestCaseEvalHandler = void 0;
const arrayify_stream_1 = require("arrayify-stream");
const rdf_string_1 = require("rdf-string");
const ErrorTest_1 = require("../../ErrorTest");
const Sequences_1 = require("../../Sequences");
const Util_1 = require("../../Util");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
/**
 * Test case handler for testing if two RDF serialization are isomorphic.
 */
class TestCaseEvalHandler {
    constructor(options) {
        this.shouldNormalizeUrl = options === null || options === void 0 ? void 0 : options.normalizeUrl;
    }
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            if (!resource.property.result) {
                throw new Error(`Missing mf:result in ${resource}`);
            }
            return new TestCaseEval(testCaseData, yield stringifyStream((yield Util_1.Util.fetchCached(resource.property.action.value, options)).body), yield (0, arrayify_stream_1.arrayifyStream)((yield Util_1.Util.fetchRdf(resource.property.result.value, Object.assign(Object.assign({}, options), { normalizeUrl: this.shouldNormalizeUrl })))[1]), this.normalizeUrl(resource.property.action.value));
        });
    }
    normalizeUrl(url) {
        return this.shouldNormalizeUrl ? Util_1.Util.normalizeBaseUrl(url) : url;
    }
}
exports.TestCaseEvalHandler = TestCaseEvalHandler;
class TestCaseEval {
    constructor(testCaseData, data, expected, baseIRI) {
        this.type = 'rdfsyntax';
        Object.assign(this, testCaseData);
        this.data = data;
        this.expected = expected;
        this.baseIRI = baseIRI;
    }
    test(parser, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const quads = yield parser.parse(this.data, this.baseIRI, injectArguments, this);
            if (!(0, Sequences_1.isomorphic)(quads, this.expected)) {
                throw new ErrorTest_1.ErrorTest(`Invalid data parsing
  Input: ${this.data}

  Expected: ${JSON.stringify(this.expected.map(rdf_string_1.quadToStringQuad), null, '  ')}

  Got: ${JSON.stringify(quads.map(rdf_string_1.quadToStringQuad), null, '  ')}
`);
            }
        });
    }
}
exports.TestCaseEval = TestCaseEval;
//# sourceMappingURL=TestCaseEval.js.map