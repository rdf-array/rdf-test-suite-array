import type * as RDF from '@rdfjs/types';
/**
 * Utility functions
 */
export declare class Util {
    static colorReset: string;
    static colorRed: string;
    static colorGreen: string;
    static colorYellow: string;
    static colorBlue: string;
    static colorMagenta: string;
    static colorCyan: string;
    static colorGray: string;
    protected static readonly extensionToContentType: Record<string, string>;
    /**
     * Determine the content type of the given URL based on the headers.
     * @param {string} url The URL to get the content type from.
     * @param {Headers} headers The headers of the given URL.
     * @return {string} The content type.
     */
    static identifyContentType(url: string, headers: Headers): string;
    /**
     * Convert https to http
     * @param {string} url A URL.
     * @return {string} An http URL.
     */
    static normalizeBaseUrl(url: string): string;
    /**
     * Fetch the given RDF document and parse it.
     * @param {string} url A URL.
     * @param {IFetchOptions} options Options for fetching.
     * @return {Promise<[string , Stream]>} A promise resolving to a pair of a URL and a parsed RDF stream.
     */
    static fetchRdf(url: string, options?: IFetchOptions): Promise<[string, RDF.Stream]>;
    /**
     * Parses RDF based on the content type.
     * @param {string} contentType The content type of the given text stream.
     * @param {string} baseIRI The base IRI of the stream.
     * @param {NodeJS.ReadableStream} data Text stream in a certain RDF serialization.
     * @param {IFetchOptions} options Options for fetching.
     * @return {Stream} A parsed RDF stream.
     */
    static parseRdfRaw(contentType: string, baseIRI: string, data: NodeJS.ReadableStream, options?: IFetchOptions): RDF.Stream;
    /**
     * Fetch the given URL or retrieve it from a local file cache.
     * @param {string} url The URL to fetch.
     * @param {IFetchOptions} options Options for fetching.
     * @param {RequestInit} init Fetch init options.
     * @return {Promise<IFetchResponse>} A promise resolving to the response.
     */
    static fetchCached(url: string, options?: IFetchOptions, init?: RequestInit): Promise<IFetchResponse>;
    /**
     * Resolve all values in a hash.
     * @param {{[p: string]: Promise<T>}} data A hash with promise values.
     * @return {Promise<{[p: string]: T}>} A hash with resolved promise values.
     */
    static promiseValues<T>(data: Record<string, Promise<T>>): Promise<Record<string, T>>;
    /**
     * Convert a license string to a URI.
     * @param {string} license A license string.
     * @return {string} A license URI.
     */
    static licenseToUri(license: string): string;
    /**
     * Return a string in a given color
     * @param str The string that should be printed in
     * @param color A given color
     */
    static withColor(str: any, color: string): string;
}
/**
 * A fetch response.
 */
export interface IFetchResponse {
    body: NodeJS.ReadableStream;
    headers: Headers;
    url: string;
}
export interface IFetchOptions {
    /**
     * The base directory to cache files in. If falsy, then no cache will be used.
     */
    cachePath?: string;
    /**
     * If the base URL should be converted from https to http.
     */
    normalizeUrl?: boolean;
    /**
     * URL to local path mapping.
     */
    urlToFileMappings?: {
        url: string;
        path: string;
    }[];
}
