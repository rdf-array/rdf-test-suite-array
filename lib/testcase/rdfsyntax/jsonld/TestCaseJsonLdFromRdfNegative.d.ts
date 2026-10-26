import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../../Util';
import type { ITestCaseData } from '../../ITestCase';
import type { ITestCaseHandler } from '../../ITestCaseHandler';
import type { ISerializer } from '../ISerializer';
import type { ITestCaseFromRdfSyntax } from '../ITestCaseFromRdfSyntax';
/**
 * Test case handler for:
 * * https://w3c.github.io/json-ld-api/tests/vocab#FromRDFTest
 * * https://w3c.github.io/json-ld-api/tests/vocab#NegativeEvaluationTest
 */
export declare class TestCaseJsonLdFromRdfNegativeHandler implements ITestCaseHandler<TestCaseJsonLdFromRdfHandlerNegative> {
    resourceToTestCaseInner(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseJsonLdFromRdfHandlerNegative>;
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseJsonLdFromRdfHandlerNegative>;
}
export declare class TestCaseJsonLdFromRdfHandlerNegative implements ITestCaseFromRdfSyntax {
    readonly type = "fromrdfsyntax";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly data: RDF.Quad[];
    readonly expectErrorCode: string;
    readonly baseIRI: string;
    readonly options: any;
    constructor(testCaseData: ITestCaseData, expectErrorCode: string, data: RDF.Quad[], baseIRI: string, options: any);
    test(serializer: ISerializer, injectArguments: any): Promise<void>;
    validateError(error: Error, _injectArguments: any): void;
    getErrorMessage(): string;
}
