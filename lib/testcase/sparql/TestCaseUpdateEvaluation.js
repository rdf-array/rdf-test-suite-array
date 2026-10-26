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
exports.TestCaseUpdateEvaluation = exports.TestCaseUpdateEvaluationHandler = void 0;
const rdf_data_factory_1 = require("rdf-data-factory");
const rdf_string_1 = require("rdf-string");
const ErrorTest_1 = require("../../ErrorTest");
const Sequences_1 = require("../../Sequences");
const Util_1 = require("../../Util");
const TestCaseQueryEvaluation_1 = require("./TestCaseQueryEvaluation");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
const DF = new rdf_data_factory_1.DataFactory();
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#UpdateEvaluationTest.
 */
class TestCaseUpdateEvaluationHandler {
    /**
     * Obtain all data links for the given update test action.
     * @param action A query test action.
     */
    static getQueryDataLinks(action) {
        const queryDataLinks = [];
        if (action.property.updateData) {
            queryDataLinks.push({
                dataUri: action.property.updateData.value,
            });
        }
        for (const updateGraphData of action.properties.updateGraphData) {
            if (updateGraphData.property.updateGraph) {
                queryDataLinks.push({
                    dataUri: updateGraphData.property.updateGraph.value,
                    dataGraph: DF.namedNode(Util_1.Util.normalizeBaseUrl(updateGraphData.property.label.value)),
                });
            }
            else {
                queryDataLinks.push({
                    dataUri: updateGraphData.value,
                    dataGraph: DF.namedNode(Util_1.Util.normalizeBaseUrl(updateGraphData.value)),
                });
            }
        }
        return queryDataLinks;
    }
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!resource.property.action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            if (!resource.property.result) {
                throw new Error(`Missing mf:result in ${resource}`);
            }
            const action = resource.property.action;
            if (!action.property.updateQuery) {
                throw new Error(`Missing ut:request in mf:action of ${resource}`);
            }
            const result = resource.property.result;
            // Determine links to data
            const dataInitialLinks = TestCaseUpdateEvaluationHandler.getQueryDataLinks(action);
            const dataExpectedLinks = TestCaseUpdateEvaluationHandler.getQueryDataLinks(result);
            // Collect all query data
            const dataInitial = yield TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler
                .resolveQueryDataLinks(dataInitialLinks, options);
            const dataExpected = yield TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler
                .resolveQueryDataLinks(dataExpectedLinks, options);
            return new TestCaseUpdateEvaluation(testCaseData, {
                baseIRI: Util_1.Util.normalizeBaseUrl(action.property.updateQuery.value),
                dataInitial,
                dataExpected,
                dataInitialLinks,
                dataExpectedLinks,
                updateQueryString: yield stringifyStream((yield Util_1.Util.fetchCached(action.property.updateQuery.value, options)).body),
            });
        });
    }
}
exports.TestCaseUpdateEvaluationHandler = TestCaseUpdateEvaluationHandler;
class TestCaseUpdateEvaluation {
    constructor(testCaseData, props) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
        Object.assign(this, props);
    }
    test(engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataResult = yield engine.update(this.dataInitial, this.updateQueryString, Object.assign({ baseIRI: this.baseIRI }, injectArguments));
            if (!(0, Sequences_1.isomorphic)(this.dataExpected, dataResult)) {
                throw new ErrorTest_1.ErrorTest(`Invalid update query evaluation

  Query:\n\n${this.updateQueryString}

  Data input links: ${TestCaseQueryEvaluation_1.TestCaseQueryEvaluation.queryDataLinksToString(this.dataInitialLinks)}

  Data expected output links: ${TestCaseQueryEvaluation_1.TestCaseQueryEvaluation.queryDataLinksToString(this.dataExpectedLinks)}

  Expected: ${JSON.stringify(this.dataExpected.map(rdf_string_1.quadToStringQuad), null, '  ')}

  Got: \n ${JSON.stringify(dataResult.map(rdf_string_1.quadToStringQuad), null, '  ')}
`);
            }
        });
    }
}
exports.TestCaseUpdateEvaluation = TestCaseUpdateEvaluation;
//# sourceMappingURL=TestCaseUpdateEvaluation.js.map