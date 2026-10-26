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
exports.manifestFromResource = manifestFromResource;
exports.manifestFromSpecificationResource = manifestFromSpecificationResource;
const ITestCase_1 = require("./testcase/ITestCase");
const Util_1 = require("./Util");
/**
 * Create a manifest object from a resource.
 * @param {{[uri: string]: ITestCaseHandler<ITestCase<any>>}} testCaseHandlers Handlers for constructing test cases.
 * @param {IFetchOptions} options The fetch options.
 * @param {Resource} resource A resource.
 * @return {Promise<IManifest>} A promise resolving to a manifest object.
 */
function manifestFromResource(testCaseHandlers, options, resource, objectLoader) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        return {
            comment: resource.property.comment ? resource.property.comment.value : null,
            label: resource.property.label ? resource.property.label.value : null,
            specifications: resource.property.specifications ?
                yield Util_1.Util.promiseValues(Object.assign.apply({}, yield Promise.all(resource.property.specifications.list
                    .map((specificationResource) => ({ [specificationResource.term.value]: manifestFromSpecificationResource(testCaseHandlers, options, specificationResource, objectLoader) }))))) :
                null,
            subManifests: yield Promise.all(
            // This is here because of the way the rdf-star test suite is published
            // @see https://github.com/rubensworks/rdf-test-suite.js/pull/78/files#r1026326410
            ((resource.properties.include.length > 0 || !objectLoader) ?
                resource :
                ((_b = (_a = objectLoader.resources) === null || _a === void 0 ? void 0 : _a[resource.value.slice(0, resource.value.lastIndexOf('.')).replace(/\/manifest$/u, '#manifest')]) !== null && _b !== void 0 ? _b : resource))
                .properties.include.flatMap((includeList) => includeList.list.map(res => manifestFromResource(testCaseHandlers, options, res, objectLoader)))),
            testEntries: (yield Promise.all(
            // This is here because of the way the rdf-star test suite is published
            // @see https://github.com/rubensworks/rdf-test-suite.js/pull/78/files#r1026326410
            ((resource.properties.entries.length > 0 || !objectLoader) ?
                resource :
                ((_d = (_c = objectLoader.resources) === null || _c === void 0 ? void 0 : _c[resource.value.slice(0, resource.value.lastIndexOf('.')).replace(/\/manifest$/u, '#manifest')]) !== null && _d !== void 0 ? _d : resource)).properties.entries.flatMap((entryList) => (entryList.list || [entryList])
                .map(res => (0, ITestCase_1.testCaseFromResource)(testCaseHandlers, options, res, true)))))
                .filter(Boolean)
                .flat(),
            uri: resource.value,
        };
    });
}
/**
 * Create a manifest object from a specification resource.
 * @param {{[uri: string]: ITestCaseHandler<ITestCase<any>>}} testCaseHandlers Handlers for constructing test cases.
 * @param {IFetchOptions} options The fetch options.
 * @param {Resource} resource A resource.
 * @return {Promise<IManifest>} A promise resolving to a manifest object.
 */
function manifestFromSpecificationResource(testCaseHandlers, options, resource, objectLoader) {
    return __awaiter(this, void 0, void 0, function* () {
        if (resource.property.conformanceRequirements) {
            const subManifests = yield Promise.all(resource.property.conformanceRequirements.list
                .map(resource => manifestFromResource(testCaseHandlers, options, resource, objectLoader)));
            return {
                comment: resource.property.comment ? resource.property.comment.value : null,
                label: resource.property.label ? resource.property.label.value : null,
                subManifests,
                uri: resource.value,
            };
        }
        return {
            comment: resource.property.comment ? resource.property.comment.value : null,
            label: resource.property.label ? resource.property.label.value : null,
            uri: resource.value,
        };
    });
}
//# sourceMappingURL=IManifest.js.map