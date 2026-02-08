import { describe, it, expect } from "vitest";
import { r10Faq } from "../rules/r10-faq.js";
import { mockPage } from "./helpers.js";

describe("R10: FAQ Content Detection", () => {
  it("passes with FAQ content and FAQPage schema", async () => {
    const page = mockPage({
      html: `<html><head>
        <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Q1","acceptedAnswer":{"@type":"Answer","text":"A1"}}]}</script>
      </head><body>
        <h1>Test</h1>
        <h2>FAQ</h2>
        <p>Question and answer content</p>
      </body></html>`,
    });
    const result = await r10Faq.check(page);
    expect(result.status).toBe("pass"); // Can be "pass" or "warn" if logic fails
    expect(result.score).toBe(5);
  });

  it("warns with FAQ content but no schema", async () => {
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
    const result = await r10Faq.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2); // Partial credit for content without schema? No, R10 says Warn -> 2.
  });

  it("skips (full points) when no FAQ content detected", async () => {
    const page = mockPage({
      html: "<html><body><h1>Regular Page</h1><p>Just normal content</p></body></html>",
    });
    const result = await r10Faq.check(page);
    expect(result.status).toBe("skip");
    expect(result.score).toBe(5);
  });

  it("passes with FAQ schema nested in @graph", async () => {
    const page = mockPage({
      html: `<html><head>
        <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},{"@type":"FAQPage","mainEntity":[]}]}</script>
      </head><body><h2>FAQ</h2></body></html>`,
    });
    const result = await r10Faq.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("handles malformed JSON-LD gracefully (warns if FAQ content present)", async () => {
    const page = mockPage({
      html: `<html><head>
        <script type="application/ld+json">{ "malformed": json, }</script>
      </head><body><h2>FAQ</h2></body></html>`,
    });
    const result = await r10Faq.check(page);
    // Should verify it survived the malformed JSON and warned about missing schema (since it couldn't be parsed)
    expect(result.status).toBe("warn");
  });
});
