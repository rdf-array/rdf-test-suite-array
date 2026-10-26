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
 * * https://w3c.github.io/json-ld-api/tests/vocab#PositiveEvaluationTest
 *
 * It will check if the serialization from RDF to JSON-LD matches with the expected JSON-LD document.
 */
export declare class TestCaseJsonLdFromRdfHandler implements ITestCaseHandler<TestCaseJsonLdFromRdf> {
    resourceToTestCaseInner(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseJsonLdFromRdf>;
    resourceToTestCase(resource: Resource, testCaseData: ITestCaseData, options?: IFetchOptions): Promise<TestCaseJsonLdFromRdf>;
}
export declare class TestCaseJsonLdFromRdf implements ITestCaseFromRdfSyntax {
    readonly type = "fromrdfsyntax";
    readonly approval: string;
    readonly approvedBy: string;
    readonly comment: string;
    readonly types: string[];
    readonly name: string;
    readonly uri: string;
    readonly data: RDF.Quad[];
    readonly expected: string;
    readonly baseIRI: string;
    readonly options: any;
    constructor(testCaseData: ITestCaseData, data: RDF.Quad[], expected: string, baseIRI: string, options: any);
    test(serializer: ISerializer, injectArguments: any): Promise<void>;
}
export declare function objectsIsomorphic(obj1: any, obj2: any, options?: IObjectsIsomorphicOptions, parentKey?: string): boolean;
export declare function arraySorter(obj1: any, obj2: any): number;
export interface IObjectsIsomorphicOptions {
    ordered?: boolean;
    strictBlankNodes?: boolean;
}
