import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IParser } from './IParser';
import type { ITestCaseRdfSyntax } from './ITestCaseRdfSyntax';
/**
 * Test case handler for checking if a syntax is valid or not.
 */
export declare class TestCaseSyntaxHandler implements ITestCaseHandler<TestCaseSyntax> {
    private readonly expectNoError;
    constructor(expectNoError: boolean);
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseSyntax>;
    protected getTestCaseClass(): any;
    protected normalizeUrl(url: string): string;
}
export declare class TestCaseSyntax implements ITestCaseRdfSyntax {
    readonly type = "rdfsyntax";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly expectNoError: boolean;
    readonly data: string;
    readonly baseIRI: string;
    constructor(testCaseData: ITestCaseData, expectError: boolean, data: string, baseIRI: string);
    test(parser: IParser, injectArguments: any): Promise<void>;
    validateError(_error: Error, _injectArguments: any): void;
    getErrorMessage(): string;
}
