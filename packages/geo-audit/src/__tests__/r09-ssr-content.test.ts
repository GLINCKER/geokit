import { describe, it, expect } from "vitest";
import { r09SsrContent } from "../rules/r09-ssr-content.js";
import { mockPage } from "./helpers.js";

describe("R09: Content Accessibility (SSR)", () => {
  it("passes with enough server-rendered content", () => {
    const longText = "This is real content. ".repeat(50);
    const page = mockPage({
      html: `<html><body><h1>Title</h1><p>${longText}</p></body></html>`,
    });
    const result = r09SsrContent.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
  });

  it("warns with thin content", () => {
    const page = mockPage({
      html: "<html><body><h1>Title</h1><p>Short content that is over 100 chars but under 500 characters total in the body text. Some more filler words.</p></body></html>",
    });
    const result = r09SsrContent.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("fails with client-side only rendering", () => {
    const page = mockPage({
      html: '<html><body><div id="root"></div><script src="/bundle.js"></script></body></html>',
    });
    const result = r09SsrContent.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
