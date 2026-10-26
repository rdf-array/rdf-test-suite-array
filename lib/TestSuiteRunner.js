"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.TestSuiteRunner = void 0;
const LogSymbols = __importStar(require("log-symbols"));
const rdf_data_factory_1 = require("rdf-data-factory");
const ManifestLoader_1 = require("./ManifestLoader");
const Util_1 = require("./Util");
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const quad = require('rdf-quad');
// eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
const streamifyArray = require('streamify-array').streamifyArray;
const DF = new rdf_data_factory_1.DataFactory();
/**
 * The specifications that are tested against a running endpoint,
 * together with the engine method that starts it,
 * and the custom engine option that its URL is passed to.
 */
const ENDPOINT_SPECIFICATIONS = [
    {
        specification: 'http://www.w3.org/TR/sparql11-service-description/',
        option: 'serviceDescriptionEndpoint',
        start: engine => { var _a; return (_a = engine.startServiceDescriptionEndpoint) === null || _a === void 0 ? void 0 : _a.call(engine); },
    },
    {
        specification: 'http://www.w3.org/TR/sparql11-protocol/',
        option: 'protocolEndpoint',
        start: engine => { var _a; return (_a = engine.startProtocolEndpoint) === null || _a === void 0 ? void 0 : _a.call(engine); },
    },
    {
        specification: 'http://www.w3.org/TR/sparql11-http-rdf-update/',
        option: 'graphStoreEndpoint',
        start: engine => { var _a; return (_a = engine.startGraphStoreEndpoint) === null || _a === void 0 ? void 0 : _a.call(engine); },
    },
];
/**
 * TestSuiteRunner runs a certain test suite manifest.
 */
class TestSuiteRunner {
    /**
     * Parse an URL to file mapping string.
     * @param {string} urlToFileMapping An URL to file mapping string
     * @return {{url: string; path: string}[]} A parsed URL to file mapping array.
     */
    fromUrlToMappingString(urlToFileMapping) {
        const urlToFileMappings = [];
        if (urlToFileMapping) {
            const [url, path] = urlToFileMapping.split('~');
            urlToFileMappings.push({ url, path });
        }
        return urlToFileMappings;
    }
    /**
     * Run the manifest with the given URL.
     * @param {string} manifestUrl The URL of a manifest.
     * @param handler The handler to run the tests with.
     * @param config The test suite configuration.
     * @return {Promise<ITestResult[]>} A promise resolving to an array of test results.
     */
    runManifest(manifestUrl, handler, config) {
        return __awaiter(this, void 0, void 0, function* () {
            const { cachePath, specification, urlToFileMapping } = config;
            const urlToFileMappings = this.fromUrlToMappingString(urlToFileMapping);
            const manifest = yield new ManifestLoader_1.ManifestLoader().from(manifestUrl, { cachePath, urlToFileMappings });
            const results = [];
            // Only run the tests for the given specification if one was defined.
            if (specification) {
                if (!manifest.specifications || !manifest.specifications[specification]) {
                    return [];
                }
                yield this.runManifestWithEndpoint(manifest.specifications[specification], handler, config, results);
                return results;
            }
            yield this.runManifestWithEndpoint(manifest, handler, config, results);
            return results;
        });
    }
    /**
     * Run a manifest, starting an endpoint if the selected specification requires one.
     * @param {string} manifest A manifest.
     * @param handler The handler to run the tests with.
     * @param config The test suite configuration.
     * @param {ITestResult[]} results An array to append the test results to.
     * @return {Promise<void>} A promise resolving when the tests are finished.
     */
    runManifestWithEndpoint(manifest, handler, config, results) {
        return __awaiter(this, void 0, void 0, function* () {
            const customEngineOptions = config.customEngingeOptions;
            const endpointSpecification = ENDPOINT_SPECIFICATIONS
                .find(entry => entry.specification === config.specification && !customEngineOptions[entry.option]);
            const endpoint = endpointSpecification ? yield endpointSpecification.start(handler) : undefined;
            if (!endpoint) {
                yield this.runManifestConcrete(manifest, handler, config, results);
                return;
            }
            try {
                yield this.runManifestConcrete(manifest, handler, Object.assign(Object.assign({}, config), { customEngingeOptions: Object.assign(Object.assign({}, customEngineOptions), { [endpointSpecification.option]: endpoint.endpoint }) }), results);
            }
            finally {
                yield endpoint.close();
            }
        });
    }
    /**
     * Run the given manifest.
     * @param {string} manifest A manifest.
     * @param handler The handler to run the tests with.
     * @param config The test suite configuration.
     * @param {ITestResult[]} results An array to append the test results to
     * @return {Promise<void>} A promise resolving when the tests are finished.
     */
    runManifestConcrete(manifest, handler, config, results) {
        return __awaiter(this, void 0, void 0, function* () {
            // Execute all tests in this manifest
            if (manifest.testEntries) {
                for (const test of manifest.testEntries) {
                    if ((!config.testRegex || config.testRegex.test(test.uri)) && !(config.skipRegex && config.skipRegex.test(test.uri))) {
                        if (!config.runRejected && test.approval === 'http://www.w3.org/ns/rdftest#Rejected') {
                            // Skip tests that are explicitly rejected
                            results.push({ test, ok: false, skipped: true, error: new Error('Rejected Test') });
                        }
                        else if (config.explicitApproval && test.approval !== 'http://www.w3.org/ns/rdftest#Approved') {
                            // Skip tests that are explicitly rejected
                            results.push({ test, ok: false, skipped: true, error: new Error('Test not explicitly approved') });
                        }
                        else {
                            let timeout = null;
                            const timeStart = process.hrtime();
                            let testResultOverride;
                            try {
                                yield Promise.race([
                                    test.test(handler, config.customEngingeOptions)
                                        .then((result) => {
                                        if (result) {
                                            testResultOverride = result;
                                        }
                                    }),
                                    new Promise((res, rej) => {
                                        // Global.setTimeout is used here to avoid browser/node compatibility issues
                                        timeout = globalThis.setTimeout(() => rej(new Error(`Test case '${test.uri}' timed out`)), config.timeOutDuration);
                                    }),
                                ]);
                            }
                            catch (error) {
                                clearTimeout(timeout);
                                results.push({ test, ok: false, error: error, skipped: error.skipped });
                                continue;
                            }
                            const timeEnd = process.hrtime(timeStart);
                            clearTimeout(timeout);
                            results.push(Object.assign({ test, ok: true, duration: (timeEnd[0] * 1000) + (timeEnd[1] / 1000000) }, testResultOverride));
                        }
                    }
                }
            }
            // Recursively handle all sub-manifests
            if (manifest.subManifests) {
                for (const subManifest of manifest.subManifests) {
                    yield (this.runManifestConcrete(subManifest, handler, config, results));
                }
            }
        });
    }
    /**
     * Print the given test results to a text stream.
     * @param {WriteStream} stdout The output stream to write to.
     * @param {ITestResult[]} results An array of test results.
     * @param {boolean} compact If the results should be printed in compact-mode.
     */
    resultsToText(stdout, results, compact) {
        const failedTests = [];
        let success = 0;
        let skipped = 0;
        for (const result of results) {
            if (result.ok) {
                success++;
                stdout.write(`${LogSymbols.success} ${result.test.name} (${result.test.uri})${` ${Util_1.Util.withColor(`${result.duration}ms`, Util_1.Util.colorGray)}`}\n`);
            }
            else if (result.skipped) {
                skipped++;
                stdout.write(`${LogSymbols.info} ${result.test.name} (${result.test.uri})\n`);
            }
            else {
                failedTests.push(result);
                stdout.write(`${LogSymbols.error} ${result.test.name} (${result.test.uri})\n`);
            }
        }
        if (!compact) {
            for (const result of failedTests) {
                stdout.write(`
${LogSymbols.error} ${Util_1.Util.withColor(result.test.name, Util_1.Util.colorRed)}
  ${result.test.comment || ''}
  ${'test' in result.error ? result.error : result.error.stack}
  ${Util_1.Util.withColor(`More info: ${result.test.uri}`, Util_1.Util.colorBlue)}

`);
            }
        }
        const skippedString = skipped ? ` (skipped ${skipped})` : '';
        success += skipped;
        if (success === results.length) {
            stdout.write(`${LogSymbols.success} ${success} / ${results.length} tests succeeded!${skippedString}\n`);
        }
        else {
            stdout.write(`${LogSymbols.error} ${success} / ${results.length} tests succeeded!${skippedString}\n`);
        }
    }
    /**
     * Convert test results to an RDF stream.
     * @param {ITestResult[]} results Test results.
     * @param {IEarlProperties} properties EARL properties.
     * @param {Date} testDate The date at which the tests were executed.
     * @return {Stream} An RDF stream of quads.
     */
    resultsToEarl(results, properties, testDate) {
        // eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
        const p = require('./prefixes.json');
        const dateRaw = testDate.toISOString();
        const date = `"${dateRaw}"^^${p.xsd}dateTime`;
        const quads = [];
        // Describe report
        const report = properties.reportUri || '';
        quads.push(DF.quad(DF.namedNode(report), DF.namedNode(`${p.foaf}primaryTopic`), DF.namedNode(properties.applicationUri)));
        quads.push(DF.quad(DF.namedNode(report), DF.namedNode(`${p.dc}issued`), DF.literal(testDate.toISOString(), DF.namedNode(`${p.xsd}dateTime`))));
        for (const author of properties.authors) {
            quads.push(DF.quad(DF.namedNode(report), DF.namedNode(`${p.foaf}maker`), DF.namedNode(author.uri)));
        }
        // Describe application
        const app = properties.applicationUri;
        quads.push(quad(app, `${p.rdf}type`, `${p.earl}Software`));
        quads.push(quad(app, `${p.rdf}type`, `${p.earl}TestSubject`));
        quads.push(quad(app, `${p.rdf}type`, `${p.doap}Project`));
        quads.push(quad(app, `${p.doap}name`, `"${properties.applicationNameFull}"`));
        quads.push(quad(app, `${p.dc}title`, `"${properties.applicationNameFull}"`));
        if (properties.version) {
            quads.push(quad(app, `${p.doap}release`, '_:b_release'));
            quads.push(quad('_:b_release', `${p.doap}revision`, `"${properties.version}"`));
        }
        quads.push(quad(app, `${p.doap}homepage`, properties.applicationHomepageUrl));
        quads.push(quad(app, `${p.doap}license`, properties.licenseUri));
        quads.push(quad(app, `${p.doap}programming-language`, '"JavaScript"'));
        for (const spec of properties.specificationUris) {
            quads.push(quad(app, `${p.doap}implements`, spec));
        }
        quads.push(quad(app, `${p.doap}category`, 'http://dbpedia.org/resource/Resource_Description_Framework'));
        quads.push(quad(app, `${p.doap}download-page`, `https://npmjs.org/package/${properties.applicationNameNpm}`));
        if (properties.applicationBugsUrl) {
            quads.push(quad(app, `${p.doap}bug-database`, properties.applicationBugsUrl));
        }
        if (properties.applicationBlogUrl) {
            quads.push(quad(app, `${p.doap}blog`, properties.applicationBlogUrl));
        }
        for (const author of properties.authors) {
            quads.push(quad(app, `${p.doap}developer`, author.uri));
            quads.push(quad(app, `${p.doap}maintainer`, author.uri));
            quads.push(quad(app, `${p.doap}documenter`, author.uri));
            quads.push(quad(app, `${p.doap}maker`, author.uri));
            quads.push(quad(app, `${p.dc}creator`, author.uri));
        }
        quads.push(quad(app, `${p.dc}description`, `"${properties.applicationDescription}"@en`));
        quads.push(quad(app, `${p.doap}description`, `"${properties.applicationDescription}"@en`));
        // Describe authors
        for (const author of properties.authors) {
            quads.push(quad(author.uri, `${p.rdf}type`, `${p.foaf}Person`));
            quads.push(quad(author.uri, `${p.rdf}type`, `${p.earl}Assertor`));
            if (author.name) {
                quads.push(quad(author.uri, `${p.foaf}name`, `"${author.name}"`));
            }
            if (author.homepage) {
                quads.push(quad(author.uri, `${p.foaf}homepage`, author.homepage));
            }
            if (author.primaryTopic) {
                quads.push(quad(author.uri, `${p.foaf}primaryTopicOf`, author.primaryTopic));
            }
        }
        // Describe test results
        let id = 0;
        for (const result of results) {
            const testUri = result.test.uri;
            quads.push(quad(testUri, `${p.rdf}type`, `${p.earl}TestCriterion`));
            quads.push(quad(testUri, `${p.rdf}type`, `${p.earl}TestCase`));
            quads.push(quad(testUri, `${p.dc}title`, `"${result.test.name}"`));
            if (result.test.comment) {
                quads.push(quad(testUri, `${p.dc}description`, `"${result.test.comment}"`));
            }
            quads.push(quad(testUri, `${p.earl}assertions`, `_:assertions${id}`));
            quads.push(quad(`_:assertions${id}`, `${p.rdf}first`, `_:assertion${id}`));
            quads.push(quad(`_:assertions${id}`, `${p.rdf}rest`, `${p.rdf}nil`));
            quads.push(quad(`_:assertion${id}`, `${p.rdf}type`, `${p.earl}Assertion`));
            for (const author of properties.authors) {
                quads.push(quad(`_:assertion${id}`, `${p.earl}assertedBy`, author.uri));
            }
            quads.push(quad(`_:assertion${id}`, `${p.earl}test`, testUri));
            quads.push(quad(`_:assertion${id}`, `${p.earl}subject`, app));
            quads.push(quad(`_:assertion${id}`, `${p.earl}mode`, `${p.earl}automatic`));
            quads.push(quad(`_:assertion${id}`, `${p.earl}result`, `_:result${id}`));
            quads.push(quad(`_:result${id}`, `${p.rdf}type`, `${p.earl}TestResult`));
            quads.push(quad(`_:result${id}`, `${p.earl}outcome`, p.earl + (result.ok ? 'passed' : (result.skipped ? 'inapplicable' : 'failed'))));
            quads.push(quad(`_:result${id}`, `${p.dc}date`, date));
            id++;
        }
        return streamifyArray(quads);
    }
    /**
     * Create an {#link IEarlProperties} data object based on package.json contents.
     * @param packageJson Package.json contents.
     * @return {IEarlProperties} A data object.
     */
    packageJsonToEarlProperties(packageJson) {
        return {
            applicationBugsUrl: packageJson.bugs && packageJson.bugs.url ? packageJson.bugs.url : packageJson.bugs,
            applicationDescription: packageJson.description,
            applicationHomepageUrl: packageJson.homepage,
            applicationNameFull: packageJson.name,
            applicationNameNpm: packageJson.name,
            applicationUri: packageJson.name ? `https://www.npmjs.com/package/${packageJson.name}/` : null,
            authors: [
                {
                    homepage: null,
                    name: packageJson.author,
                    uri: `https://www.npmjs.com/package/${packageJson.name}/#author`,
                },
            ],
            licenseUri: packageJson.license ? Util_1.Util.licenseToUri(packageJson.license) : null,
            reportUri: null,
            specificationUris: [],
            version: packageJson.version,
        };
    }
}
exports.TestSuiteRunner = TestSuiteRunner;
//# sourceMappingURL=TestSuiteRunner.js.map