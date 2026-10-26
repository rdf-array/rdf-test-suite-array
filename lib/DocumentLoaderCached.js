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
exports.DocumentLoaderCached = void 0;
const Util_1 = require("./Util");
/**
 * A JSON-LD context document loader that is based on {@link Util#fetchCached}.
 */
class DocumentLoaderCached {
    constructor(options) {
        this.options = options;
    }
    load(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = yield Util_1.Util.fetchCached(url, this.options, { headers: { accept: 'application/ld+json' } });
            // eslint-disable-next-line ts/no-require-imports, ts/no-var-requires
            return JSON.parse(yield require('stream-to-string')(body));
        });
    }
}
exports.DocumentLoaderCached = DocumentLoaderCached;
//# sourceMappingURL=DocumentLoaderCached.js.map