/**
 * Error to indicate that this is a test failure.
 */
export declare class ErrorTest extends Error {
    readonly test: boolean;
    constructor(message?: string);
}
