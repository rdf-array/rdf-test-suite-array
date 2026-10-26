import type { RdfObjectLoader, Resource } from 'rdf-object';
import type { ITestCase } from './testcase/ITestCase';
import type { ITestCaseHandler } from './testcase/ITestCaseHandler';
import type { IFetchOptions } from './Util';
/**
 * A manifest data holder.
 */
export interface IManifest {
    uri: string;
    label?: string;
    comment?: string;
    subManifests?: IManifest[];
    testEntries?: ITestCase<any>[];
    specifications?: Record<string, IManifest>;
}
/**
 * Create a manifest object from a resource.
 * @param {{[uri: string]: ITestCaseHandler<ITestCase<any>>}} testCaseHandlers Handlers for constructing test cases.
 * @param {IFetchOptions} options The fetch options.
 * @param {Resource} resource A resource.
 * @return {Promise<IManifest>} A promise resolving to a manifest object.
 */
export declare function manifestFromResource(testCaseHandlers: Record<string, ITestCaseHandler<ITestCase<any>>>, options: IFetchOptions, resource: Resource, objectLoader: RdfObjectLoader): Promise<IManifest>;
/**
 * Create a manifest object from a specification resource.
 * @param {{[uri: string]: ITestCaseHandler<ITestCase<any>>}} testCaseHandlers Handlers for constructing test cases.
 * @param {IFetchOptions} options The fetch options.
 * @param {Resource} resource A resource.
 * @return {Promise<IManifest>} A promise resolving to a manifest object.
 */
export declare function manifestFromSpecificationResource(testCaseHandlers: Record<string, ITestCaseHandler<ITestCase<any>>>, options: IFetchOptions, resource: Resource, objectLoader: RdfObjectLoader): Promise<IManifest>;
