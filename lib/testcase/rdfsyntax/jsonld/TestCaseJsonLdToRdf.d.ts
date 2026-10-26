import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../../Util';
import type { ITestCase, ITestCaseData } from '../../ITestCase';
import type { TestCaseEval } from '../TestCaseEval';
import { TestCaseEvalHandler } from '../TestCaseEval';
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#ToRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#PositiveEvaluationTest
 */
export declare class TestCaseJsonLdToRdfHandler extends TestCaseEvalHandler {
    static getOptions(resource: Resource, options?: IFetchOptions): Promise<{
        injectArguments: any;
        testProperties: any;
    }>;
    static wrap<H, T extends ITestCase<H>>(superHandler: (resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions) => Promise<T>, resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<T>;
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseEval>;
    protected normalizeUrl(url: string): string;
}
