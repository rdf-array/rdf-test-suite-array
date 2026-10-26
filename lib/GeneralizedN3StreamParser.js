"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralizedN3StreamParser = void 0;
const node_stream_1 = require("node:stream");
const n3_1 = require("n3");
// Temporarily set format to text/n3 to allow blank node predicates (needed by JSON-LD tests)
const readPredicateOld = n3_1.Parser.prototype._readPredicate;
n3_1.Parser.prototype._readPredicate = function (token) {
    if (this.allowBlankNodePredicates) {
        this._n3Mode = true;
        this._quantified = {};
    }
    const ret = readPredicateOld.call(this, token);
    if (this.allowBlankNodePredicates) {
        this._n3Mode = false;
        delete this._quantified;
    }
    return ret;
};
class GeneralizedN3StreamParser extends node_stream_1.Transform {
    constructor(options) {
        super({ decodeStrings: true });
        this._readableState.objectMode = true;
        // Set up parser
        const parser = new n3_1.Parser(options);
        parser.allowBlankNodePredicates = true;
        // This is a workaround to resolve the RDF* syntax issue seen in
        // https://github.com/rubensworks/rdf-test-suite.js/pull/78#issue-1307275029
        parser._supportsRDFStar = true;
        let onData;
        let onEnd;
        // Pass dummy stream to obtain `data` and `end` callbacks
        parser.parse({
            on: (event, callback) => {
                switch (event) {
                    case 'data':
                        onData = callback;
                        break;
                    case 'end':
                        onEnd = callback;
                        break;
                }
            },
        }, 
        // Handle quads by pushing them down the pipeline
        (error, quad) => (error && this.emit('error', error)) || (quad && this.push(quad)), 
        // Emit prefixes through the `prefix` event
        (prefix, uri) => {
            this.emit('prefix', prefix, uri);
        });
        // Implement Transform methods through parser callbacks
        this._transform = (chunk, encoding, done) => {
            onData(chunk);
            done();
        };
        this._flush = (done) => {
            onEnd();
            done();
        };
    }
}
exports.GeneralizedN3StreamParser = GeneralizedN3StreamParser;
//# sourceMappingURL=GeneralizedN3StreamParser.js.map