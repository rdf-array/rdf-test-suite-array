import type { Resource } from 'rdf-object';
import type { ITestCase, ITestCaseData } from './ITestCase';
import type { ITestCaseHandler } from './ITestCaseHandler';
/**
 * A fallback test case handler that constructs unsupported test cases.
 */
export declare class TestCaseUnsupportedHandler implements ITestCaseHandler<TestCaseUnsupported> {
    private readonly name;
    constructor(name: string);
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData): Promise<TestCaseUnsupported>;
}
export declare class TestCaseUnsupported implements ITestCase<any> {
    readonly type = "unsupported";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly testCaseName: string;
    constructor(testCaseName: string, testCaseData: ITestCaseData);
    test(_engine: any): Promise<void>;
}
