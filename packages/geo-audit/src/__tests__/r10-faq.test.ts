import { describe, it, expect } from "vitest";
import { r10Faq } from "../rules/r10-faq.js";
import { mockPage } from "./helpers.js";

describe("R10: FAQ Content Detection", () => {
  it("passes with FAQ content and FAQPage schema", () => {
    const page = mockPage({
      html: `<html><head>
        <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Q1","acceptedAnswer":{"@type":"Answer","text":"A1"}}]}</script>
      </head><body>
        <h1>Test</h1>
        <h2>FAQ</h2>
        <p>Question and answer content</p>
      </body></html>`,
    });
    const result = r10Faq.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("warns with FAQ content but no schema", () => {
    const page = mockPage({
      html: `<html><body>
        <h1>Test</h1>
        <h2>Frequently Asked Questions</h2>
        <dl>
          <dt>Question 1</dt><dd>Answer 1</dd>
          <dt>Question 2</dt><dd>Answer 2</dd>
        </dl>
      </body></html>`,
    });
    const result = r10Faq.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
  });

  it("skips (full points) when no FAQ content detected", () => {
    const page = mockPage({
      html: "<html><body><h1>Regular Page</h1><p>Just normal content</p></body></html>",
    });
    const result = r10Faq.check(page);
    expect(result.status).toBe("skip");
    expect(result.score).toBe(5);
  });
});
