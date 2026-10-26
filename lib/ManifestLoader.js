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
exports.ManifestLoader = void 0;
const arrayify_stream_1 = require("arrayify-stream");
const rdf_object_1 = require("rdf-object");
const rdf_string_1 = require("rdf-string");
const IManifest_1 = require("./IManifest");
const Sequences_1 = require("./Sequences");
const Util_1 = require("./Util");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const streamifyArray = require('streamify-array').streamifyArray;
/**
 * A ManifestLoader loads test suites from URLs.
 */
class ManifestLoader {
    constructor(args) {
        if (!args) {
            args = {};
        }
        this.testCaseHandlers = args.testCaseHandlers || ManifestLoader.defaultTestCaseHandlers;
    }
    /**
     * Load the manifest from the given URL.
     * @param {string} url The URL of a manifest.
     * @param {IFetchOptions} options The fetch options.
     * @return {Promise<IManifest>} A promise that resolves to a manifest object.
     */
    from(url, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectLoader = new rdf_object_1.RdfObjectLoader({ context: ManifestLoader.loaderContext });
            const manifest = yield this.import(objectLoader, url, options);
            return (0, IManifest_1.manifestFromResource)(this.testCaseHandlers, options, manifest, objectLoader);
        });
    }
    import(objectLoader, urlInitial, options) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fragment of the URL the caller asked for (e.g. 'manifest'), if any.
            const hashIndex = urlInitial.indexOf('#');
            const requestedFragment = hashIndex >= 0 ? urlInitial.slice(hashIndex + 1) : undefined;
            const [url, parsed] = yield Util_1.Util.fetchRdf(urlInitial, options);
            // Dereference the URL and load it; rdf-array: a manifest's ( … ) lists are read as sequence terms,
            // which rdf-object knows only as rdf:first/rdf:rest ladders
            yield objectLoader.import(streamifyArray((0, Sequences_1.expandSequences)(yield (0, arrayify_stream_1.arrayifyStream)(parsed), Sequences_1.RDF_LADDER)));
            function findManifest() {
                const extLess = url.slice(0, url.lastIndexOf('.'));
                let result;
                // Highest priority: the resource the caller explicitly named via a fragment,
                // resolved against the fetched (fragment-less) document URL.
                if (requestedFragment) {
                    result = objectLoader.resources[`${url}#${requestedFragment}`];
                }
                // Second try the same URL as the document URL
                result !== null && result !== void 0 ? result : (result = objectLoader.resources[url]);
                // Also try extension-less manifest URL (needed for RDFa test suite)
                result !== null && result !== void 0 ? result : (result = objectLoader.resources[extLess]);
                // Also try extension-less and with the last '/' replaced with a '#' (needed for RDFstar test suite)
                // @see https://github.com/w3c/rdf-star/issues/269
                return result !== null && result !== void 0 ? result : objectLoader.resources[extLess.replace(/\/manifest$/u, '#manifest')];
            }
            // Import all sub-manifests
            let manifest = findManifest();
            if (!manifest) {
                throw new Error(`Could not find a resource ${url} in the document at ${url}`);
            }
            const includeJobs = [];
            for (const includeList of manifest.properties.include) {
                for (const include of includeList.list) {
                    if (include.term.termType !== 'NamedNode') {
                        throw new Error(`Found invalid manifest term ${(0, rdf_string_1.termToString)(include.term)} when parsing ${url}`);
                    }
                    includeJobs.push(this.import(objectLoader, include.value, options));
                }
            }
            yield Promise.all(includeJobs);
            // Re-resolve, as sub-manifest imports may have extended the manifest resource
            manifest = findManifest();
            return manifest;
        });
    }
}
exports.ManifestLoader = ManifestLoader;
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
ManifestLoader.defaultTestCaseHandlers = require('./testcase/TestCaseHandlers');
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
ManifestLoader.loaderContext = require('./context-manifest.json');
//# sourceMappingURL=ManifestLoader.js.map