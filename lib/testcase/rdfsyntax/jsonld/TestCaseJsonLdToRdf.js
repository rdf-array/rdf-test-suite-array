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
exports.TestCaseJsonLdToRdfHandler = void 0;
const rdf_data_factory_1 = require("rdf-data-factory");
const relative_to_absolute_iri_1 = require("relative-to-absolute-iri");
const Util_1 = require("../../../Util");
const TestCaseEval_1 = require("../TestCaseEval");
const DF = new rdf_data_factory_1.DataFactory();
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#PositiveEvaluationTest
 */
class TestCaseJsonLdToRdfHandler extends TestCaseEval_1.TestCaseEvalHandler {
    static getOptions(resource, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const injectArguments = {
                produceGeneralizedRdf: false,
            };
            const testProperties = {};
            // Only apply some properties for HTML tests
            const isHtml = resource.isA(DF.namedNode('https://w3c.github.io/json-ld-api/tests/vocab#HtmlTest'));
            if (isHtml) {
                injectArguments.contentType = 'text/html';
            }
            // Loop over the options
            for (const option of resource.properties.jsonLdOptions) {
                // Should generalized RDF should be produced?
                if (option.property.jsonLdProduceGeneralizedRdf) {
                    injectArguments.produceGeneralizedRdf = option.property.jsonLdProduceGeneralizedRdf.term.value === 'true';
                }
                // Override the default base IRI
                if (option.property.jsonLdBase) {
                    injectArguments.baseIRI = option.property.jsonLdBase.term.value;
                }
                // Override the default base IRI
                if (option.property.jsonLdExpandContext) {
                    const expandContextUrl = (0, relative_to_absolute_iri_1.resolve)(option.property.jsonLdExpandContext.term.value, resource.property.action.value);
                    // eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
                    injectArguments.context = JSON.parse(yield require('stream-to-string')((yield Util_1.Util.fetchCached(expandContextUrl, options)).body));
                }
                // The processing mode
                // If undefined, all processors should be able to handle the test,
                // otherwise, only processors explicitly supporting that mode should run the test.
                if (option.property.processingMode) {
                    // Remove the 'json-ld-' prefix from the string
                    injectArguments.processingMode = option.property.processingMode.term.value.slice(8);
                }
                // The spec for which this test was defined.
                if (option.property.specVersion) {
                    // Remove the 'json-ld-' prefix from the string
                    injectArguments.specVersion = option.property.specVersion.term.value.slice(8);
                }
                // If RDF-star processing is enabled
                if (option.property.rdfstar) {
                    // Remove the 'json-ld-' prefix from the string
                    injectArguments.rdfstar = option.property.rdfstar.term.value === 'true';
                }
                // The rdfDirection mode for @direction handling
                if (option.property.rdfDirection) {
                    injectArguments.rdfDirection = option.property.rdfDirection.term.value;
                }
                // Should native types be used?
                if (option.property.useNativeTypes) {
                    injectArguments.useNativeTypes = option.property.useNativeTypes.term.value === 'true';
                }
                // Should RDF type be used?
                if (option.property.useRdfType) {
                    injectArguments.useRdfType = option.property.useRdfType.term.value === 'true';
                }
                // HTML: If all scripts should be extracted
                if (isHtml && option.property.extractAllScripts) {
                    injectArguments.extractAllScripts = option.property.extractAllScripts.term.value === 'true';
                }
                // HTML: The overridden content type
                if (isHtml && option.property.contentType) {
                    injectArguments.contentType = option.property.contentType.term.value;
                }
            }
            // An optional root context.
            if (resource.property.context) {
                // eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
                injectArguments.context = JSON.parse(yield require('stream-to-string')((yield Util_1.Util.fetchCached(resource.property.context.term.value, options)).body));
            }
            // An optional expected error code
            if (resource.property.expectJsonLdErrorCode) {
                testProperties.expectErrorCode = resource.property.expectJsonLdErrorCode.term.value;
            }
            return { injectArguments, testProperties };
        });
    }
    static wrap(superHandler, resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { injectArguments: injectArgumentsAdditional, testProperties } = yield TestCaseJsonLdToRdfHandler
                .getOptions(resource, options);
            // Assign additional test properties
            Object.assign(testCaseData, testProperties);
            // Construct test case
            const testCaseEval = yield superHandler(resource, testCaseData, options);
            // Add additional inject arguments
            // eslint-disable-next-line ts/unbound-method
            const testOld = testCaseEval.test;
            testCaseEval.test = (handler, injectArguments) => testOld.bind(testCaseEval)(handler, Object.assign(Object.assign({}, injectArgumentsAdditional), injectArguments));
            return testCaseEval;
        });
    }
    resourceToTestCase(resource, testCaseData, options) {
        return TestCaseJsonLdToRdfHandler.wrap(super.resourceToTestCase.bind(this), resource, testCaseData, options);
    }
    normalizeUrl(url) {
        return url;
    }
}
exports.TestCaseJsonLdToRdfHandler = TestCaseJsonLdToRdfHandler;
//# sourceMappingURL=TestCaseJsonLdToRdf.js.map