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
exports.TestCaseCsvResultFormat = exports.TestCaseCsvResultFormatHandler = void 0;
const papaparse_1 = require("papaparse");
const ErrorTest_1 = require("../../ErrorTest");
const Util_1 = require("../../Util");
const TestCaseQueryEvaluation_1 = require("./TestCaseQueryEvaluation");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const stringifyStream = require('stream-to-string');
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#CSVResultFormatTest.
 */
class TestCaseCsvResultFormatHandler {
    resourceToTestCase(resource, testCaseData, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const action = resource.property.action;
            if (!action) {
                throw new Error(`Missing mf:action in ${resource}`);
            }
            if (!resource.property.result) {
                throw new Error(`Missing mf:result in ${resource}`);
            }
            if (!action.property.query) {
                throw new Error(`Missing qt:query in mf:action of ${resource}`);
            }
            const queryDataLinks = TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler.getQueryDataLinks(action);
            const queryData = yield TestCaseQueryEvaluation_1.TestCaseQueryEvaluationHandler.resolveQueryDataLinks(queryDataLinks, options);
            const resultSource = yield Util_1.Util.fetchCached(resource.property.result.value, options);
            return new TestCaseCsvResultFormat(testCaseData, {
                baseIRI: Util_1.Util.normalizeBaseUrl(action.property.query.value),
                expectedResult: yield stringifyStream(resultSource.body),
                queryDataLinks,
                queryData,
                queryString: yield stringifyStream((yield Util_1.Util.fetchCached(action.property.query.value, options)).body),
                resultSource,
            });
        });
    }
}
exports.TestCaseCsvResultFormatHandler = TestCaseCsvResultFormatHandler;
class TestCaseCsvResultFormat {
    constructor(testCaseData, props) {
        this.type = 'sparql';
        Object.assign(this, testCaseData);
        Object.assign(this, props);
    }
    static parseCsv(result) {
        const parsed = (0, papaparse_1.parse)(result, {
            header: true,
            skipEmptyLines: true,
        });
        const strictErrors = parsed.errors.filter(e => e.code !== 'UndetectableDelimiter');
        if (strictErrors.length > 0) {
            const error = strictErrors[0];
            throw new Error(`Invalid CSV result (Row ${error.row}): ${error.message}`);
        }
        if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
            throw new Error('Invalid CSV result: Missing header row.');
        }
        return {
            variables: parsed.meta.fields,
            rows: parsed.data,
        };
    }
    static matchRows(expectedRows, actualRows, bNodeMapping = {}) {
        if (expectedRows.length === 0) {
            return actualRows.length === 0;
        }
        const expectedRow = expectedRows[0];
        const remainingExpected = expectedRows.slice(1);
        for (let i = 0; i < actualRows.length; i++) {
            const actualRow = actualRows[i];
            const newMapping = Object.assign({}, bNodeMapping);
            let rowMatches = true;
            for (const [variable, expectedVal] of Object.entries(expectedRow)) {
                const actualVal = actualRow[variable];
                if (expectedVal && expectedVal.startsWith('_:')) {
                    if (!actualVal || !actualVal.startsWith('_:')) {
                        rowMatches = false;
                        break;
                    }
                    if (newMapping[expectedVal]) {
                        if (newMapping[expectedVal] !== actualVal) {
                            rowMatches = false;
                            break;
                        }
                    }
                    else {
                        if (Object.values(newMapping).includes(actualVal)) {
                            rowMatches = false;
                            break;
                        }
                        newMapping[expectedVal] = actualVal;
                    }
                }
                else if (expectedVal !== actualVal) {
                    rowMatches = false;
                    break;
                }
            }
            if (rowMatches) {
                const remainingActual = [...actualRows.slice(0, i), ...actualRows.slice(i + 1)];
                if (this.matchRows(remainingExpected, remainingActual, newMapping)) {
                    return true;
                }
            }
        }
        return false;
    }
    static csvResultsEqual(expected, actual) {
        try {
            const expectedData = TestCaseCsvResultFormat.parseCsv(expected);
            const actualData = TestCaseCsvResultFormat.parseCsv(actual);
            if (expectedData.rows.length !== actualData.rows.length) {
                return false;
            }
            const expectedVars = expectedData.variables;
            const actualVars = actualData.variables;
            const expectedSorted = [...expectedVars].sort().join(',');
            const actualSorted = [...actualVars].sort().join(',');
            if (expectedSorted !== actualSorted) {
                return false;
            }
            return TestCaseCsvResultFormat.matchRows(expectedData.rows, actualData.rows);
        }
        catch (_a) {
            return false;
        }
    }
    test(engine, injectArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!engine.queryResultFormat) {
                throw new ErrorTest_1.ErrorTest('CSV result format tests require queryResultFormat to be implemented by the query engine.');
            }
            const result = yield stringifyStream(yield engine.queryResultFormat(this.queryData, this.queryString, 'text/csv', Object.assign({ baseIRI: this.baseIRI }, injectArguments)));
            if (!TestCaseCsvResultFormat.csvResultsEqual(this.expectedResult, result)) {
                throw new ErrorTest_1.ErrorTest(`Invalid CSV result format

  Query:\n\n${this.queryString}

  Data links: ${TestCaseQueryEvaluation_1.TestCaseQueryEvaluation.queryDataLinksToString(this.queryDataLinks)}

  Result Source: ${this.resultSource.url}

  Expected:\n${this.expectedResult}

  Got:\n${result}
`);
            }
        });
    }
}
exports.TestCaseCsvResultFormat = TestCaseCsvResultFormat;
//# sourceMappingURL=TestCaseCsvResultFormat.js.map