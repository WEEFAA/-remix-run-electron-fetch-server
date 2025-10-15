import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequestListener } from "../lib/request-listener";
import type { FetchHandler } from "../types";

describe("createRequestListener", () => {
    // Test 1: Basic handler execution
    it("should call handler and return response", async () => {
        let handlerCalled = false;
        let receivedRequest: Request | null = null;

        const mockResponse = new Response("Hello World");
        const handler: FetchHandler = async (req) => {
            handlerCalled = true;
            receivedRequest = req;
            return mockResponse;
        };

        const listener = createRequestListener(handler);
        const request = new Request("https://example.com/test");
        const response = await listener(request);

        assert.equal(handlerCalled, true);
        assert.equal(receivedRequest, request);
        assert.equal(await response.text(), "Hello World");
    });

    // Test 2: Default error handling
    it("should return 500 response on handler error", async () => {
        const handler: FetchHandler = async () => {
            throw new Error("Test error");
        };

        const listener = createRequestListener(handler);
        const request = new Request("https://example.com/test");
        const response = await listener(request);

        assert.equal(response.status, 500);
        assert.equal(await response.text(), "Internal Server Error");
    });

    // Test 3: Custom error handler
    it("should use custom onError handler", async () => {
        let errorHandlerCalled = false;
        let capturedError: unknown = null;

        const handler: FetchHandler = async () => {
            throw new Error("Test error");
        };

        const customErrorResponse = new Response("Custom Error", {
            status: 503,
        });
        const onError = async (error: unknown) => {
            errorHandlerCalled = true;
            capturedError = error;
            return customErrorResponse;
        };

        const listener = createRequestListener(handler, { onError });
        const request = new Request("https://example.com/test");
        const response = await listener(request);

        assert.equal(errorHandlerCalled, true);
        assert.ok(capturedError instanceof Error);
        assert.equal(response.status, 503);
        assert.equal(await response.text(), "Custom Error");
    });

    // Test 4: Protocol override
    it("should catch request protocol when specified", async () => {
        let capturedRequest: Request | null = null;

        const handler: FetchHandler = async (req) => {
            capturedRequest = req;
            return new Response("OK");
        };

        const listener = createRequestListener(handler);
        const request = new Request("diffProto://example.com/test");
        await listener(request);

        assert.ok(capturedRequest !== null);
        assert.equal(
            new URL((capturedRequest as Request).url).protocol,
            "diffproto:"
        );
    });

    // Test 5: Abort signal - already aborted
    it("should return 499 when signal is already aborted", async () => {
        let handlerCalled = false;

        const handler: FetchHandler = async () => {
            handlerCalled = true;
            return new Response("Should not reach");
        };

        const abortController = new AbortController();
        abortController.abort();

        const listener = createRequestListener(handler, {
            signal: abortController.signal,
        });

        const request = new Request("https://example.com/test");
        const response = await listener(request);

        assert.equal(handlerCalled, false);
        assert.equal(response.status, 499);
        assert.equal(await response.text(), "Request aborted");
    });

    // Test 6: Synchronous handler
    it("should handle synchronous handler return", async () => {
        const mockResponse = new Response("Sync Response");
        const handler: FetchHandler = () => mockResponse;

        const listener = createRequestListener(handler);
        const request = new Request("https://example.com/test");
        const response = await listener(request);

        assert.equal(await response.text(), "Sync Response");
    });

    // Test 7: Error handler that returns void
    it("should return 500 when error handler returns void", async () => {
        let errorHandlerCalled = false;

        const handler: FetchHandler = async () => {
            throw new Error("Test");
        };

        const onError = async () => {
            errorHandlerCalled = true;
            return undefined;
        };

        const listener = createRequestListener(handler, { onError });
        const request = new Request("https://example.com/test");
        const response = await listener(request);

        assert.equal(errorHandlerCalled, true);
        assert.equal(response.status, 500);
    });
});
