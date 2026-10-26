/**
 * An error to indicate if a test should be skipped.
 */
export declare class ErrorSkipped extends Error {
    readonly skipped: boolean;
    constructor(message?: string);
}
