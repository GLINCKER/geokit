import { describe, it, expect } from "vitest";
import { r08Headings } from "../rules/r08-headings.js";
import { mockPage } from "./helpers.js";

describe("R08: Heading Hierarchy", () => {
  it("passes with proper heading structure", () => {
    const page = mockPage({
      html: "<html><body><h1>Title</h1><h2>Section</h2><h3>Sub</h3></body></html>",
    });
    const result = r08Headings.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(10);
  });

  it("warns with multiple H1 tags", () => {
    const page = mockPage({
      html: "<html><body><h1>Title 1</h1><h1>Title 2</h1><h2>Sub</h2></body></html>",
    });
    const result = r08Headings.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("warns with skipped levels", () => {
    const page = mockPage({
      html: "<html><body><h1>Title</h1><h3>Skipped H2</h3></body></html>",
    });
    const result = r08Headings.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(5);
  });

  it("fails with no H1", () => {
    const page = mockPage({
      html: "<html><body><h2>No H1</h2><h3>Sub</h3></body></html>",
    });
    const result = r08Headings.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(2);
  });

  it("fails with no headings at all", () => {
    const page = mockPage({
      html: "<html><body><p>No headings</p></body></html>",
    });
    const result = r08Headings.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
