import { describe, it, expect } from "vitest";
import { r22LlmsFullTxt } from "../rules/r22-llms-full-txt.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R22: llms-full.txt Exists", () => {
  it("fails when file not found", () => {
    const page = mockPage({
      llmsFullTxt: mockFetch({ ok: false, status: 404, body: "" }),
    });
    const result = r22LlmsFullTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("No /llms-full.txt file found");
  });

  it("fails when file is empty", () => {
    const page = mockPage({
      llmsFullTxt: mockFetch({ ok: true, status: 200, body: "" }),
    });
    const result = r22LlmsFullTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("empty");
  });

  it("fails when file is only whitespace", () => {
    const page = mockPage({
      llmsFullTxt: mockFetch({ ok: true, status: 200, body: "   \n\n  \t  " }),
    });
    const result = r22LlmsFullTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("warns when file is too short (<500 chars)", () => {
    const page = mockPage({
      llmsFullTxt: mockFetch({
        ok: true,
        status: 200,
        body: "# Example\n\nShort description",
      }),
    });
    const result = r22LlmsFullTxt.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.length).toBeLessThan(500);
  });

  it("passes when file is substantial (500+ chars)", () => {
    const page = mockPage({
      llmsFullTxt: mockFetch({
        ok: true,
        status: 200,
        body: "# Comprehensive Documentation\n\n" + "x".repeat(500),
      }),
    });
    const result = r22LlmsFullTxt.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.length).toBeGreaterThanOrEqual(500);
  });

  it("reports character length in details", () => {
    const body = "# Test\n\n" + "a".repeat(600);
    const page = mockPage({
      llmsFullTxt: mockFetch({ ok: true, status: 200, body }),
    });
    const result = r22LlmsFullTxt.check(page);
    expect(result.details?.length).toBe(body.length);
  });
});
