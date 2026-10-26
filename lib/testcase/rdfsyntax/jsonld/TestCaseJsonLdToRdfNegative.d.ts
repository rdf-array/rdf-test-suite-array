import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../../Util';
import type { ITestCaseData } from '../../ITestCase';
import { TestCaseSyntax, TestCaseSyntaxHandler } from '../TestCaseSyntax';
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#NegativeEvaluationTest
 */
export declare class TestCaseJsonLdToRdfNegativeHandler extends TestCaseSyntaxHandler {
    constructor();
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseSyntax>;
    protected normalizeUrl(url: string): string;
    protected getTestCaseClass(): any;
}
export declare class TestCaseJsonLdToRdfHandlerNegative extends TestCaseSyntax {
    readonly expectErrorCode: string;
    constructor(testCaseData: ITestCaseData, expectError: boolean, data: string, baseIRI: string);
    validateError(error: Error, _injectArguments: any): void;
    getErrorMessage(): string;
}
