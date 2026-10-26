import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IQueryEngine } from './IQueryEngine';
import type { ITestCaseSparql } from './ITestCaseSparql';
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#NegativeSyntaxTest.
 */
export declare class TestCaseNegativeSyntaxHandler implements ITestCaseHandler<TestCaseNegativeSyntax> {
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseNegativeSyntax>;
}
export declare class TestCaseNegativeSyntax implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly queryString: string;
    readonly baseIRI: string;
    constructor(testCaseData: ITestCaseData, queryString: string, baseIRI: string);
    test(engine: IQueryEngine, injectArguments: any): Promise<void>;
}
