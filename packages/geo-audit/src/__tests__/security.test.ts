import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to export isBlockedHost from fetcher.ts to test it directly
// But it's not exported.
// We can mock fetch and see if safeFetch throws for blocked URLs.

// We need to import safeFetch but it is not exported either?
// fetchPageData IS exported. fetchPageData calls safeFetch.
// Let's test fetchPageData with blocked URLs.

import { fetchPageData } from "../fetcher.js";

describe("Security: SSRF Protection", () => {
    // Mock fetch so we don't actually hit network if protection fails (which would be bad in test)
    // But we expect it to THROW before calling fetch.
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    beforeEach(() => {
        fetchMock.mockReset();
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            text: async () => "<html></html>",
            headers: new Headers(),
        });
    });

    it("blocks localhost", async () => {
        await expect(fetchPageData("http://localhost")).rejects.toThrow("Blocked");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("blocks 127.0.0.1", async () => {
        await expect(fetchPageData("http://127.0.0.1")).rejects.toThrow("Blocked");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("blocks 0.0.0.0", async () => {
        await expect(fetchPageData("http://0.0.0.0")).rejects.toThrow("Blocked");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("blocks 10.x.x.x private range", async () => {
        await expect(fetchPageData("http://10.0.0.5")).rejects.toThrow("Blocked");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("blocks 192.168.x.x private range", async () => {
        await expect(fetchPageData("http://192.168.1.1")).rejects.toThrow("Blocked");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("blocks 172.16.x.x private range", async () => {
        await expect(fetchPageData("http://172.16.0.1")).rejects.toThrow("Blocked");
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("allows public IP", async () => {
        await expect(fetchPageData("http://8.8.8.8")).resolves.toBeDefined();
        expect(fetchMock).toHaveBeenCalled();
    });

    it("allows public domain", async () => {
        await expect(fetchPageData("http://example.com")).resolves.toBeDefined();
        expect(fetchMock).toHaveBeenCalled();
    });
});
