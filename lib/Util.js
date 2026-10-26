"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
const node_fs_1 = require("node:fs");
const node_stream_1 = require("node:stream");
// eslint-disable-next-line ts/no-require-imports
const isStream = require("is-stream");
const jsonld_streaming_parser_1 = require("jsonld-streaming-parser");
const rdfxml_streaming_parser_1 = require("rdfxml-streaming-parser");
const readable_web_to_node_stream_1 = require("readable-web-to-node-stream");
const DocumentLoaderCached_1 = require("./DocumentLoaderCached");
const GeneralizedN3StreamParser_1 = require("./GeneralizedN3StreamParser");
/**
 * Utility functions
 */
// eslint-disable-next-line ts/no-extraneous-class
class Util {
    /**
     * Determine the content type of the given URL based on the headers.
     * @param {string} url The URL to get the content type from.
     * @param {Headers} headers The headers of the given URL.
     * @return {string} The content type.
     */
    static identifyContentType(url, headers) {
        const contentType = headers.get('Content-Type');
        return (contentType && !contentType.includes('application/octet-stream') ? contentType : false) ||
            Util.extensionToContentType[url.slice(url.lastIndexOf('.') + 1)] ||
            'unknown';
    }
    // TODO: remove in the next major release
    /**
     * Convert https to http
     * @param {string} url A URL.
     * @return {string} An http URL.
     */
    static normalizeBaseUrl(url) {
        if (url.startsWith('https://')) {
            return url.replace('https', 'http');
        }
        return url;
    }
    /**
     * Fetch the given RDF document and parse it.
     * @param {string} url A URL.
     * @param {IFetchOptions} options Options for fetching.
     * @return {Promise<[string , Stream]>} A promise resolving to a pair of a URL and a parsed RDF stream.
     */
    static fetchRdf(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}) {
            const response = yield Util.fetchCached(url, options);
            const contentType = Util.identifyContentType(response.url, response.headers);
            const baseIri = options.normalizeUrl ? Util.normalizeBaseUrl(response.url) : response.url;
            return [response.url, Util.parseRdfRaw(contentType, baseIri, response.body, options)];
        });
    }
    /**
     * Parses RDF based on the content type.
     * @param {string} contentType The content type of the given text stream.
     * @param {string} baseIRI The base IRI of the stream.
     * @param {NodeJS.ReadableStream} data Text stream in a certain RDF serialization.
     * @param {IFetchOptions} options Options for fetching.
     * @return {Stream} A parsed RDF stream.
     */
    static parseRdfRaw(contentType, baseIRI, data, options = {}) {
        if (contentType.includes('application/x-turtle') ||
            contentType.includes('text/turtle') ||
            contentType.includes('application/n-triples') ||
            contentType.includes('application/n-quads') ||
            contentType.includes('application/trig')) {
            return data.pipe(new GeneralizedN3StreamParser_1.GeneralizedN3StreamParser({ baseIRI, format: contentType }));
        }
        if (contentType.includes('application/rdf+xml')) {
            return data.pipe(new rdfxml_streaming_parser_1.RdfXmlParser({ baseIRI }));
        }
        if (contentType.includes('application/ld+json')) {
            const documentLoader = new DocumentLoaderCached_1.DocumentLoaderCached(options);
            return data.pipe(new jsonld_streaming_parser_1.JsonLdParser({ baseIRI, documentLoader }));
        }
        if (baseIRI.endsWith('.ttl')) {
            return data.pipe(new GeneralizedN3StreamParser_1.GeneralizedN3StreamParser({ baseIRI, format: 'text/turtle' }));
        }
        if (baseIRI.endsWith('.trig')) {
            return data.pipe(new GeneralizedN3StreamParser_1.GeneralizedN3StreamParser({ baseIRI, format: 'application/trig' }));
        }
        throw new Error(`Could not parse the RDF serialization ${contentType} on ${baseIRI}`);
    }
    /**
     * Fetch the given URL or retrieve it from a local file cache.
     * @param {string} url The URL to fetch.
     * @param {IFetchOptions} options Options for fetching.
     * @param {RequestInit} init Fetch init options.
     * @return {Promise<IFetchResponse>} A promise resolving to the response.
     */
    static fetchCached(url_1) {
        return __awaiter(this, arguments, void 0, function* (url, options = {}, init) {
            // First check local file mappings
            if (options.urlToFileMappings) {
                for (const urlToFileMapping of options.urlToFileMappings) {
                    if (url.startsWith(urlToFileMapping.url)) {
                        let pathSuffix = url.slice(urlToFileMapping.url.length);
                        // Remove hashes from path
                        const hashPos = pathSuffix.indexOf('#');
                        if (hashPos >= 0) {
                            pathSuffix = pathSuffix.slice(0, Math.max(0, hashPos));
                        }
                        // Resolve file path
                        const filePath = urlToFileMapping.path + pathSuffix;
                        if (!(0, node_fs_1.existsSync)(filePath)) {
                            throw new Error(`Could not find file ${filePath}`);
                        }
                        return {
                            body: (0, node_fs_1.createReadStream)(filePath),
                            headers: new Headers({}),
                            url: urlToFileMapping.url + pathSuffix,
                        };
                    }
                }
            }
            const encodedUrl = encodeURIComponent(url);
            const cachePathLocal = options.cachePath && encodedUrl.length <= 255 ?
                options.cachePath + encodedUrl :
                null;
            if (cachePathLocal && (0, node_fs_1.existsSync)(cachePathLocal)) {
                // Read from cache
                return {
                    body: (0, node_fs_1.createReadStream)(cachePathLocal),
                    headers: new Headers(JSON.parse((0, node_fs_1.readFileSync)(`${cachePathLocal}.headers`, { encoding: 'utf8' }))),
                    url: (0, node_fs_1.readFileSync)(`${cachePathLocal}.url`, { encoding: 'utf8' }),
                };
            }
            // Do actual fetch
            const response = yield fetch(url, init);
            if (!response.ok) {
                throw new Error(`Could not find ${url}`);
            }
            /* istanbul ignore next */
            const body = isStream(response.body) || response.body === null ?
                response.body :
                new readable_web_to_node_stream_1.ReadableWebToNodeStream(response.body);
            const body1 = body.pipe(new node_stream_1.PassThrough());
            const body2 = body.pipe(new node_stream_1.PassThrough());
            // Remove unneeded headers (copy to make sure the Headers object is not immutable)
            const headers = new Headers(response.headers);
            headers.delete('content-length');
            headers.delete('content-encoding');
            if (cachePathLocal) {
                // Save in cache
                const writeStream = (0, node_fs_1.createWriteStream)(cachePathLocal, 'utf8');
                body1.pipe(writeStream);
                // To fix the problem of files being empty sometimes
                yield new Promise(resolve => setImmediate(resolve));
                try {
                    (0, node_fs_1.writeFileSync)(`${cachePathLocal}.url`, response.url || url);
                    const headersRaw = {};
                    for (const [key, value] of headers) {
                        headersRaw[key] = value;
                    }
                    (0, node_fs_1.writeFileSync)(`${cachePathLocal}.headers`, JSON.stringify(headersRaw));
                }
                catch (error) {
                    // Silently ignore errors if name is too long
                    if (error.code === 'ENAMETOOLONG') {
                        // eslint-disable-next-line no-console
                        console.error(String(error));
                    }
                    else {
                        throw error;
                    }
                }
            }
            return {
                body: body2,
                headers,
                url: response.url || url,
            };
        });
    }
    /**
     * Resolve all values in a hash.
     * @param {{[p: string]: Promise<T>}} data A hash with promise values.
     * @return {Promise<{[p: string]: T}>} A hash with resolved promise values.
     */
    static promiseValues(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newData = {};
            for (const key in data) {
                newData[key] = yield data[key];
            }
            return newData;
        });
    }
    /**
     * Convert a license string to a URI.
     * @param {string} license A license string.
     * @return {string} A license URI.
     */
    static licenseToUri(license) {
        // TODO: make this more error-prone like here:
        // https://github.com/LinkedSoftwareDependencies/npm-extraction-server/blob/master/lib/npm/NpmContext.js#L151
        return `http://opensource.org/licenses/${license}`;
    }
    /**
     * Return a string in a given color
     * @param str The string that should be printed in
     * @param color A given color
     */
    static withColor(str, color) {
        return `${color}${str}${Util.colorReset}`;
    }
}
exports.Util = Util;
Util.colorReset = '\x1B[0m';
Util.colorRed = '\x1B[31m';
Util.colorGreen = '\x1B[32m';
Util.colorYellow = '\x1B[33m';
Util.colorBlue = '\x1B[34m';
Util.colorMagenta = '\x1B[35m';
Util.colorCyan = '\x1B[36m';
Util.colorGray = '\x1B[90m';
Util.extensionToContentType = {
    csv: 'text/csv',
    jsonld: 'application/ld+json',
    nq: 'application/n-quads',
    nt: 'application/n-triples',
    srj: 'application/sparql-results+json',
    srx: 'application/sparql-results+xml',
    tsv: 'text/tab-separated-values',
    ttl: 'text/turtle',
};
//# sourceMappingURL=Util.js.map