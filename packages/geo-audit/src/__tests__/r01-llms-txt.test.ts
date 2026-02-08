import { describe, it, expect } from "vitest";
import { r01LlmsTxt } from "../rules/r01-llms-txt.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R01: llms.txt", () => {
  it("passes when llms.txt exists with H1 heading", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ body: "# My Site\n\nDescription here" }),
    });
    const result = r01LlmsTxt.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
  });

  it("warns when llms.txt exists but no H1 heading", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ body: "Just some text without heading" }),
    });
    const result = r01LlmsTxt.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("fails when llms.txt returns 404", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ ok: false, status: 404, body: "" }),
    });
    const result = r01LlmsTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("fails when llms.txt is empty", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ body: "" }),
    });
    const result = r01LlmsTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("handles whitespace-only llms.txt", () => {
    const page = mockPage({
      llmsTxt: mockFetch({ body: "   \n\n   " }),
    });
    const result = r01LlmsTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
