import { describe, it, expect } from "vitest";
import { r23AiTxt } from "../rules/r23-ai-txt.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R23: ai.txt Exists", () => {
  it("fails when file not found", () => {
    const page = mockPage({
      aiTxt: mockFetch({ ok: false, status: 404, body: "" }),
    });
    const result = r23AiTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("No /ai.txt file found");
  });

  it("fails when file is empty", () => {
    const page = mockPage({
      aiTxt: mockFetch({ ok: true, status: 200, body: "" }),
    });
    const result = r23AiTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("empty");
  });

  it("fails when file is only whitespace", () => {
    const page = mockPage({
      aiTxt: mockFetch({ ok: true, status: 200, body: "   \n\n  \t  " }),
    });
    const result = r23AiTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("passes when file has content", () => {
    const page = mockPage({
      aiTxt: mockFetch({
        ok: true,
        status: 200,
        body: "# AI Interaction Policy\n\nOur site allows AI crawlers with attribution.",
      }),
    });
    const result = r23AiTxt.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });

  it("reports character length in details", () => {
    const body = "AI policy content here";
    const page = mockPage({
      aiTxt: mockFetch({ ok: true, status: 200, body }),
    });
    const result = r23AiTxt.check(page);
    expect(result.details?.length).toBe(body.length);
  });

  it("handles server error", () => {
    const page = mockPage({
      aiTxt: mockFetch({
        ok: false,
        status: 500,
        body: "",
        error: "Internal server error",
      }),
    });
    const result = r23AiTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.details?.status).toBe(500);
    expect(result.details?.error).toBe("Internal server error");
  });
});
