import type { Resource } from 'rdf-object';
import { RdfObjectLoader } from 'rdf-object';
import type { IManifest } from './IManifest';
import type { ITestCase } from './testcase/ITestCase';
import type { ITestCaseHandler } from './testcase/ITestCaseHandler';
import type { IFetchOptions } from './Util';
/**
 * A ManifestLoader loads test suites from URLs.
 */
export declare class ManifestLoader {
    static readonly defaultTestCaseHandlers: Record<string, ITestCaseHandler<ITestCase<any>>>;
    static readonly loaderContext: Record<string, unknown>;
    private readonly testCaseHandlers;
    constructor(args?: IManifestLoaderArgs);
    /**
     * Load the manifest from the given URL.
     * @param {string} url The URL of a manifest.
     * @param {IFetchOptions} options The fetch options.
     * @return {Promise<IManifest>} A promise that resolves to a manifest object.
     */
    from(url: string, options?: IFetchOptions): Promise<IManifest>;
    protected import(objectLoader: RdfObjectLoader, urlInitial: string, options?: IFetchOptions): Promise<Resource>;
}
export interface IManifestLoaderArgs {
    testCaseHandlers?: Record<string, ITestCaseHandler<ITestCase<any>>>;
}
