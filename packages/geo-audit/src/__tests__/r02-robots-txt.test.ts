import { describe, it, expect } from "vitest";
import { r02RobotsTxt } from "../rules/r02-robots-txt.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R02: robots.txt AI Crawler Rules", () => {
  it("passes with AI bot rules", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: "User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /private\n\nUser-agent: ClaudeBot\nAllow: /\n",
      }),
    });
    const result = r02RobotsTxt.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
    expect(result.details?.foundBots).toContain("GPTBot");
    expect(result.details?.foundBots).toContain("ClaudeBot");
  });

  it("warns when robots.txt exists but no AI rules", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: "User-agent: *\nAllow: /\nDisallow: /admin\n",
      }),
    });
    const result = r02RobotsTxt.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("fails when no robots.txt", () => {
    const page = mockPage({
      robotsTxt: mockFetch({ ok: false, status: 404, body: "" }),
    });
    const result = r02RobotsTxt.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });

  it("detects case-insensitive bot names", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: "User-agent: gptbot\nAllow: /\n",
      }),
    });
    const result = r02RobotsTxt.check(page);
    expect(result.status).toBe("pass");
  });
});
