import type { IDocumentLoader, IJsonLdContext } from 'jsonld-context-parser';
import type { IFetchOptions } from './Util';
/**
 * A JSON-LD context document loader that is based on {@link Util#fetchCached}.
 */
export declare class DocumentLoaderCached implements IDocumentLoader {
    private readonly options;
    constructor(options: IFetchOptions);
    load(url: string): Promise<IJsonLdContext>;
}
