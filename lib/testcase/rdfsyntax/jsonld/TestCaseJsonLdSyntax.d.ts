import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../../Util';
import type { ITestCaseData } from '../../ITestCase';
import type { TestCaseSyntax } from '../TestCaseSyntax';
import { TestCaseSyntaxHandler } from '../TestCaseSyntax';
/**
 * Test case handler for:
 * * https://json-ld.org/test-suite/vocab#NegativeEvaluationTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#PositiveSyntaxTest
 */
export declare class TestCaseJsonLdSyntaxHandler extends TestCaseSyntaxHandler {
    constructor(expectNoError: boolean);
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseSyntax>;
    protected normalizeUrl(url: string): string;
}
