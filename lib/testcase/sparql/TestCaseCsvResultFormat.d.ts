import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { IFetchOptions, IFetchResponse } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IQueryEngine } from './IQueryEngine';
import type { ITestCaseSparql } from './ITestCaseSparql';
import type { IQueryDataLink } from './TestCaseQueryEvaluation';
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#CSVResultFormatTest.
 */
export declare class TestCaseCsvResultFormatHandler implements ITestCaseHandler<TestCaseCsvResultFormat> {
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseCsvResultFormat>;
}
export interface ITestCaseCsvResultFormatProps {
    baseIRI: string;
    queryString: string;
    queryData: RDF.Quad[];
    expectedResult: string;
    resultSource: IFetchResponse;
    queryDataLinks: IQueryDataLink[];
}
export declare class TestCaseCsvResultFormat implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly baseIRI: string;
    readonly queryString: string;
    readonly queryData: RDF.Quad[];
    readonly expectedResult: string;
    readonly resultSource: IFetchResponse;
    readonly queryDataLinks: IQueryDataLink[];
    constructor(testCaseData: ITestCaseData, props: ITestCaseCsvResultFormatProps);
    static parseCsv(result: string): {
        variables: string[];
        rows: Record<string, string>[];
    };
    private static matchRows;
    static csvResultsEqual(expected: string, actual: string): boolean;
    test(engine: IQueryEngine, injectArguments: any): Promise<void>;
}
