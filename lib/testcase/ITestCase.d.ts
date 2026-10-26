import type { Resource } from 'rdf-object';
import type { ITestResultOverride } from '../TestSuiteRunner';
import type { IFetchOptions } from '../Util';
import type { ITestCaseHandler } from './ITestCaseHandler';
export interface ITestCaseData {
    uri: string;
    types: string[];
    name: string;
    comment: string;
    approval: string;
    approvedBy: string;
}
/**
 * A test case data holder.
 */
export interface ITestCase<H> extends ITestCaseData {
    type: string;
    test(handler: H, injectArguments: any): Promise<void | ITestResultOverride>;
}
/**
 * Create a test case object from a resource.
 * @param {{[uri: string]: ITestCaseHandler<ITestCase<any>>}} testCaseHandlers Handlers for constructing test cases.
 * @param options Fetch options.
 * @param {Resource} resource A resource.
 * @param allowMultiple Whether to allow multiple test cases.
 * @return {Promise<ITestCase<any>>} A promise resolving to a test case object.
 */
export declare function testCaseFromResource(testCaseHandlers: Record<string, ITestCaseHandler<ITestCase<any>>>, options: IFetchOptions, resource: Resource, allowMultiple?: boolean): Promise<ITestCase<any> | ITestCase<any>[] | null>;
