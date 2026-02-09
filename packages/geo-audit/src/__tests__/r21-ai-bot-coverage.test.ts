import { describe, it, expect } from "vitest";
import { r21AiBotCoverage } from "../rules/r21-ai-bot-coverage.js";
import { mockPage, mockFetch } from "./helpers.js";

describe("R21: AI Bot Coverage Breadth", () => {
  it("skips when no robots.txt", () => {
    const page = mockPage({
      robotsTxt: mockFetch({ ok: false, status: 404, body: "" }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.status).toBe("skip");
    expect(result.score).toBe(0);
  });

  it("fails with 0 bots mentioned", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: "User-agent: *\nAllow: /\nDisallow: /admin\n",
      }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.details?.mentioned).toBe(0);
  });

  it("warns with 1-3 bots mentioned", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: "User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nDisallow: /\n",
      }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
    expect(result.details?.mentioned).toBe(2);
  });

  it("warns with 4-6 bots mentioned", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: `User-agent: *\nAllow: /
User-agent: GPTBot\nAllow: /
User-agent: ClaudeBot\nAllow: /
User-agent: Google-Extended\nAllow: /
User-agent: PerplexityBot\nDisallow: /
User-agent: Amazonbot\nAllow: /`,
      }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.mentioned).toBe(5);
  });

  it("passes with 7+ bots mentioned", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: `User-agent: *\nAllow: /
User-agent: GPTBot\nAllow: /
User-agent: ClaudeBot\nAllow: /
User-agent: Google-Extended\nAllow: /
User-agent: PerplexityBot\nAllow: /
User-agent: Amazonbot\nAllow: /
User-agent: CCBot\nAllow: /
User-agent: Bytespider\nDisallow: /`,
      }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.mentioned).toBe(7);
  });

  it("distinguishes allowed vs blocked bots", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: `User-agent: GPTBot\nAllow: /
User-agent: ClaudeBot\nDisallow: /
User-agent: Google-Extended\nAllow: /`,
      }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.details?.allowed).toContain("GPTBot");
    expect(result.details?.allowed).toContain("Google-Extended");
    expect(result.details?.blocked).toContain("ClaudeBot");
    expect(result.details?.allowed).toHaveLength(2);
    expect(result.details?.blocked).toHaveLength(1);
  });

  it("is case-insensitive", () => {
    const page = mockPage({
      robotsTxt: mockFetch({
        body: `user-agent: gptbot\nallow: /
user-agent: CLAUDEBOT\nallow: /
user-agent: Google-extended\nallow: /`,
      }),
    });
    const result = r21AiBotCoverage.check(page);
    expect(result.details?.mentioned).toBe(3);
    expect(result.details?.allowed).toContain("GPTBot");
    expect(result.details?.allowed).toContain("ClaudeBot");
    expect(result.details?.allowed).toContain("Google-Extended");
  });
});
