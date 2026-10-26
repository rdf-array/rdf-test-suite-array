import type * as RDF from '@rdfjs/types';
import type { Resource } from 'rdf-object';
import type { IFetchOptions } from '../../Util';
import type { ITestCaseData } from '../ITestCase';
import type { ITestCaseHandler } from '../ITestCaseHandler';
import type { IParser } from './IParser';
import type { ITestCaseRdfSyntax } from './ITestCaseRdfSyntax';
/**
 * Test case handler for testing if two RDF serialization are isomorphic.
 */
export declare class TestCaseEvalHandler implements ITestCaseHandler<TestCaseEval> {
    private readonly shouldNormalizeUrl;
    constructor(options?: {
        normalizeUrl?: boolean;
    });
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseEval>;
    protected normalizeUrl(url: string): string;
}
export declare class TestCaseEval implements ITestCaseRdfSyntax {
    readonly type = "rdfsyntax";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly data: string;
    readonly expected: RDF.Quad[];
    readonly baseIRI: string;
    constructor(testCaseData: ITestCaseData, data: string, expected: RDF.Quad[], baseIRI: string);
    test(parser: IParser, injectArguments: any): Promise<void>;
}
