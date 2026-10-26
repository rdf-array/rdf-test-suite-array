import type { Resource } from 'rdf-object';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IQueryEngine } from './IQueryEngine';
import type { ITestCaseSparql } from './ITestCaseSparql';
export interface IServiceDescriptionTestOptions {
    /** The SPARQL endpoint whose service description is under test. */
    serviceDescriptionEndpoint?: string;
}
/**
 * Test case handler for http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#ServiceDescriptionTest.
 */
export declare class TestCaseServiceDescriptionHandler implements ITestCaseHandler<TestCaseServiceDescription> {
    resourceToTestCase(_resource: Resource, testCaseData: ITestCaseData): Promise<TestCaseServiceDescription>;
}
export declare class TestCaseServiceDescription implements ITestCaseSparql {
    readonly type = "sparql";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    constructor(testCaseData: ITestCaseData);
    test(_engine: IQueryEngine, injectArguments: IServiceDescriptionTestOptions): Promise<void>;
    private static getEndpoint;
    private static getServiceDescription;
    private static validateSchema;
    private static termKey;
}
