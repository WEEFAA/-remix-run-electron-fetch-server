import type { FetchHandler, RequestListenerOptions } from "../types";

/**
 * Wraps a fetch handler for use with Electron's `protocol.handle()`.
 *
 * This adapter provides a consistent interface with `@remix-run/node-fetch-server`,
 * including error handling, protocol override, and abort signal support.
 *
 * Unlike the Node.js version which converts between Node streams and Web APIs,
 * this adapter works directly with Web API Request/Response objects since
 * Electron's protocol.handle() already uses the Web Fetch API.
 *
 * Example:
 *
 * ```ts
 * import { protocol } from 'electron';
 * import { createRequestListener } from '@remix-run/electron-fetch-server';
 *
 * async function handler(request) {
 *   return new Response('Hello, world!');
 * }
 *
 * protocol.handle('myapp', createRequestListener(handler));
 * ```
 *
 * @param handler - The fetch handler to use for processing incoming requests.
 * @param options - Request listener options.
 * @returns A handler function compatible with Electron's protocol.handle().
 */
export function createRequestListener(
    handler: FetchHandler,
    options?: RequestListenerOptions
): (request: Request) => Promise<Response> {
    let onError = options?.onError ?? defaultErrorHandler;

    return async (request) => {
        // Check if aborted before processing
        if (options?.signal?.aborted) {
            return abortedResponse();
        }

        let response: Response;

        try {
            response = await handler(request);
        } catch (error) {
            // Check if error was due to abort
            if (options?.signal?.aborted) {
                return abortedResponse();
            }

            // Handle error using error handler
            try {
                response = (await onError(error)) ?? internalServerError();
            } catch (handlerError) {
                console.error(
                    `There was an error in the error handler: ${handlerError}`
                );
                response = internalServerError();
            }
        }

        // Check if aborted after processing
        if (options?.signal?.aborted) {
            return abortedResponse();
        }

        return response;
    };
}

function defaultErrorHandler(error: unknown): Response {
    console.error(error);
    return internalServerError();
}

function internalServerError(): Response {
    return new Response(
        // "Internal Server Error"
        new Uint8Array([
            73, 110, 116, 101, 114, 110, 97, 108, 32, 83, 101, 114, 118, 101,
            114, 32, 69, 114, 114, 111, 114,
        ]),
        {
            status: 500,
            headers: {
                "Content-Type": "text/plain",
            },
        }
    );
}

function abortedResponse(): Response {
    return new Response("Request aborted", { status: 499 });
}
