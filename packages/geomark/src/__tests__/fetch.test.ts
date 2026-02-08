import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchUrl } from "../extract.js";

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe("fetchUrl", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks localhost", async () => {
    await expect(fetchUrl("http://localhost:3000")).rejects.toThrow("Blocked");
  });

  it("blocks private IP 127.0.0.1", async () => {
    await expect(fetchUrl("http://127.0.0.1:8080")).rejects.toThrow("Blocked");
  });

  it("blocks private IP 192.168.1.1", async () => {
    await expect(fetchUrl("http://192.168.1.1")).rejects.toThrow("Blocked");
  });

  it("blocks private IP 10.0.0.1", async () => {
    await expect(fetchUrl("http://10.0.0.1")).rejects.toThrow("Blocked");
  });

  it("fetches valid public URL", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      url: "https://example.com",
      text: () => Promise.resolve("<html>Content</html>"),
    });

    const result = await fetchUrl("https://example.com");
    expect(result.html).toBe("<html>Content</html>");
    expect(result.finalUrl).toBe("https://example.com");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com",
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": expect.stringContaining("GeoKit"),
        }),
      })
    );
  });

  it("throws on HTTP error", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchUrl("https://example.com/404")).rejects.toThrow("HTTP 404: Not Found");
  });

  it("throws on timeout", async () => {
    fetchMock.mockImplementation((url, options) => {
      return new Promise((resolve, reject) => {
        const signal = options?.signal;
        if (signal?.aborted) {
          return reject(new Error("The operation was aborted"));
        }
        signal?.addEventListener("abort", () => {
          reject(new Error("The operation was aborted"));
        });
        // Logic to simulate slow response, relying on timers
        setTimeout(() => {
             resolve({ ok: true, text: () => Promise.resolve("") });
        }, 20000);
      });
    });

    const promise = fetchUrl("https://example.com/timeout", { timeout: 100 });
    
    // Advance time to trigger the internal setTimeout(abort)
    vi.advanceTimersByTime(200);
    
    await expect(promise).rejects.toThrow("The operation was aborted");
  });
});
