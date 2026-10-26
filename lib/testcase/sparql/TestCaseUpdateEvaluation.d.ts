import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { ITestCaseSparql } from './ITestCaseSparql';
import type { IUpdateEngine } from './IUpdateEngine';
import type { IQueryDataLink } from './TestCaseQueryEvaluation';
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#UpdateEvaluationTest.
 */
export declare class TestCaseUpdateEvaluationHandler implements ITestCaseHandler<TestCaseUpdateEvaluation> {
    /**
     * Obtain all data links for the given update test action.
     * @param action A query test action.
     */
    static getQueryDataLinks(action: Resource): IQueryDataLink[];
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseUpdateEvaluation>;
}
export interface ITestCaseUpdateEvaluationProps {
    baseIRI: string;
    updateQueryString: string;
    dataInitial: RDF.Quad[];
    dataExpected: RDF.Quad[];
    dataInitialLinks: IQueryDataLink[];
    dataExpectedLinks: IQueryDataLink[];
}
export declare class TestCaseUpdateEvaluation implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly baseIRI: string;
    readonly updateQueryString: string;
    readonly dataInitial: RDF.Quad[];
    readonly dataExpected: RDF.Quad[];
    readonly dataInitialLinks: IQueryDataLink[];
    readonly dataExpectedLinks: IQueryDataLink[];
    constructor(testCaseData: ITestCaseData, props: ITestCaseUpdateEvaluationProps);
    test(engine: IUpdateEngine, injectArguments: any): Promise<void>;
}
