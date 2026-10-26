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
exports.testCaseFromResource = testCaseFromResource;
const rdf_string_1 = require("rdf-string");
/**
 * Create a test case object from a resource.
 * @param {{[uri: string]: ITestCaseHandler<ITestCase<any>>}} testCaseHandlers Handlers for constructing test cases.
 * @param options Fetch options.
 * @param {Resource} resource A resource.
 * @param allowMultiple Whether to allow multiple test cases.
 * @return {Promise<ITestCase<any>>} A promise resolving to a test case object.
 */
function testCaseFromResource(testCaseHandlers_1, options_1, resource_1) {
    return __awaiter(this, arguments, void 0, function* (testCaseHandlers, options, resource, allowMultiple = false) {
        const baseTestCase = {
            approval: resource.property.approval ? resource.property.approval.value : (resource.property.rdftApproval ? resource.property.rdftApproval.value : null),
            approvedBy: resource.property.approvedBy ? resource.property.approvedBy.value : null,
            comment: resource.property.comment ? resource.property.comment.value : null,
            name: resource.property.name ? resource.property.name.value : null,
            types: resource.properties.types.map(r => (0, rdf_string_1.termToString)(r.term)),
            uri: resource.term.value,
        };
        const empty = allowMultiple ? [] : null;
        if (resource.properties.types.length === 0) {
            // Ignore undefined test cases, this is applicable in the official test cases,
            // like http://www.w3.org/2009/sparql/docs/tests/data-sparql11/http-rdf-update/manifest#put__empty_graph
            return empty;
        }
        const handlers = [];
        const availableTypes = new Set(resource.properties.types.map(term => term.value));
        for (const [key, handler] of Object.entries(testCaseHandlers)) {
            if (key.split(' ').every(type => availableTypes.has(type))) {
                handlers.push([key, handler]);
            }
        }
        if (handlers.length === 0) {
            // eslint-disable-next-line no-console
            console.error(new Error(`Could not find a test case handler for ${resource.value} with types ${baseTestCase.types}`).toString());
            return empty;
        }
        try {
            const res = (yield Promise.all(handlers.map(([key, handler]) => handler.resourceToTestCase(resource, Object.assign(Object.assign({}, baseTestCase), { types: key.split(' ') }), options)))).filter(Boolean);
            return allowMultiple ? res : res[0];
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error(e.toString());
            return empty;
        }
    });
}
//# sourceMappingURL=ITestCase.js.map