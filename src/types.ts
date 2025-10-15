/**
 * Type for a fetch handler function that processes requests
 */
export type FetchHandler = (request: Request) => Promise<Response> | Response;

/**
 * Type for an error handler function that handles errors thrown by the fetch handler
 */
export type ErrorHandler = (
    error: unknown
) => Promise<Response | void> | Response | void;

/**
 * Options for createRequestListener
 */
export interface RequestListenerOptions {
    /**
     * An error handler that determines the response when the request handler throws an error.
     * By default a 500 Internal Server Error response will be sent.
     *
     * @example
     * ```ts
     * createRequestListener(handler, {
     *   onError: async (error) => {
     *     console.error('Request failed:', error)
     *     return new Response('Something went wrong', { status: 500 })
     *   }
     * })
     * ```
     */
    onError?: ErrorHandler;

    /**
     * Abort signal for cancelling requests.
     * Useful for cleanup when Electron app is closing.
     *
     * @example
     * ```ts
     * const abortController = new AbortController()
     *
     * createRequestListener(handler, {
     *   signal: abortController.signal
     * })
     *
     * app.on('before-quit', () => {
     *   abortController.abort()
     * })
     * ```
     */
    signal?: AbortSignal;
}
