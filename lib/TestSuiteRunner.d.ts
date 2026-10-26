import type * as RDF from '@rdfjs/types';
import type { IManifest } from './IManifest';
import type { ITestCase } from './testcase/ITestCase';
import WriteStream = NodeJS.WriteStream;
export interface ITestSuiteConfig {
    exitWithStatusCode0: boolean;
    explicitApproval?: boolean;
    runRejected?: boolean;
    outputFormat: string;
    timeOutDuration: number;
    customEngingeOptions: object;
    specification?: string;
    cachePath?: string;
    testRegex?: RegExp;
    skipRegex?: RegExp;
    urlToFileMapping?: string;
}
/**
 * TestSuiteRunner runs a certain test suite manifest.
 */
export declare class TestSuiteRunner {
    /**
     * Parse an URL to file mapping string.
     * @param {string} urlToFileMapping An URL to file mapping string
     * @return {{url: string; path: string}[]} A parsed URL to file mapping array.
     */
    fromUrlToMappingString(urlToFileMapping?: string): {
        url: string;
        path: string;
    }[];
    /**
     * Run the manifest with the given URL.
     * @param {string} manifestUrl The URL of a manifest.
     * @param handler The handler to run the tests with.
     * @param config The test suite configuration.
     * @return {Promise<ITestResult[]>} A promise resolving to an array of test results.
     */
    runManifest(manifestUrl: string, handler: any, config: ITestSuiteConfig): Promise<ITestResult[]>;
    /**
     * Run a manifest, starting an endpoint if the selected specification requires one.
     * @param {string} manifest A manifest.
     * @param handler The handler to run the tests with.
     * @param config The test suite configuration.
     * @param {ITestResult[]} results An array to append the test results to.
     * @return {Promise<void>} A promise resolving when the tests are finished.
     */
    private runManifestWithEndpoint;
    /**
     * Run the given manifest.
     * @param {string} manifest A manifest.
     * @param handler The handler to run the tests with.
     * @param config The test suite configuration.
     * @param {ITestResult[]} results An array to append the test results to
     * @return {Promise<void>} A promise resolving when the tests are finished.
     */
    runManifestConcrete(manifest: IManifest, handler: any, config: ITestSuiteConfig, results: ITestResult[]): Promise<void>;
    /**
     * Print the given test results to a text stream.
     * @param {WriteStream} stdout The output stream to write to.
     * @param {ITestResult[]} results An array of test results.
     * @param {boolean} compact If the results should be printed in compact-mode.
     */
    resultsToText(stdout: WriteStream, results: ITestResult[], compact: boolean): void;
    /**
     * Convert test results to an RDF stream.
     * @param {ITestResult[]} results Test results.
     * @param {IEarlProperties} properties EARL properties.
     * @param {Date} testDate The date at which the tests were executed.
     * @return {Stream} An RDF stream of quads.
     */
    resultsToEarl(results: ITestResult[], properties: IEarlProperties, testDate: Date): RDF.Stream;
    /**
     * Create an {#link IEarlProperties} data object based on package.json contents.
     * @param packageJson Package.json contents.
     * @return {IEarlProperties} A data object.
     */
    packageJsonToEarlProperties(packageJson: any): IEarlProperties;
}
export interface IEarlProperties {
    reportUri: string;
    authors: IAuthor[];
    licenseUri: string;
    applicationUri: string;
    applicationHomepageUrl: string;
    applicationBugsUrl?: string;
    applicationBlogUrl?: string;
    applicationNameFull: string;
    applicationNameNpm: string;
    applicationDescription: string;
    specificationUris: string[];
    version?: string;
}
export interface IAuthor {
    uri: string;
    name?: string;
    homepage?: string;
    primaryTopic?: string;
}
export interface ITestResult extends ITestResultOverride {
    test: ITestCase<any>;
    ok: boolean;
    error?: Error;
    skipped?: boolean;
}
export interface ITestResultOverride {
    duration?: number;
}
