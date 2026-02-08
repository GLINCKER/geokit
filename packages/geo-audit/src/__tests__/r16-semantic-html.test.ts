import { describe, it, expect } from "vitest";
import { r16SemanticHtml } from "../rules/r16-semantic-html.js";
import { mockPage } from "./helpers.js";

describe("R16: Semantic HTML", () => {
  it("passes when 3+ semantic elements are found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <header><h1>Header</h1></header>
        <nav><a href="/">Home</a></nav>
        <main>
          <article><p>Content</p></article>
          <aside><p>Sidebar</p></aside>
        </main>
        <footer><p>Footer</p></footer>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.count).toBeGreaterThanOrEqual(3);
    expect(result.details?.semanticElements).toContain("main");
    expect(result.details?.semanticElements).toContain("header");
    expect(result.details?.semanticElements).toContain("footer");
  });

  it("passes with exactly 3 semantic elements", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <header><h1>Header</h1></header>
        <main><p>Content</p></main>
        <footer><p>Footer</p></footer>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.count).toBe(3);
  });

  it("passes with all 7 semantic elements", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <header><h1>Header</h1></header>
        <nav><a href="/">Home</a></nav>
        <main>
          <article>
            <section><p>Section content</p></section>
          </article>
          <aside><p>Sidebar</p></aside>
        </main>
        <footer><p>Footer</p></footer>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.count).toBe(7);
  });

  it("warns when 2 semantic elements found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <header><h1>Header</h1></header>
        <div class="content"><p>Content in div</p></div>
        <footer><p>Footer</p></footer>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.count).toBe(2);
  });

  it("warns when only 1 semantic element found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <main><p>Just main content</p></main>
        <div class="wrapper"><div class="content">Divs everywhere</div></div>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.count).toBe(1);
  });

  it("fails when no semantic elements found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <div class="header"><h1>Header</h1></div>
        <div class="nav"><a href="/">Home</a></div>
        <div class="content"><p>All divs</p></div>
        <div class="footer"><p>Footer</p></div>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.details?.count).toBe(0);
    expect(result.details?.semanticElements).toEqual([]);
  });

  it("counts multiple instances of same element as one type", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <section><p>Section 1</p></section>
        <section><p>Section 2</p></section>
        <section><p>Section 3</p></section>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.count).toBe(1);
    expect(result.details?.semanticElements).toEqual(["section"]);
  });

  it("correctly identifies mixed semantic elements", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <nav><a href="/">Home</a></nav>
        <article><p>Article 1</p></article>
        <article><p>Article 2</p></article>
        <aside><p>Sidebar</p></aside>
      </body></html>`,
    });
    const result = r16SemanticHtml.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.count).toBe(3);
    expect(result.details?.semanticElements).toContain("nav");
    expect(result.details?.semanticElements).toContain("article");
    expect(result.details?.semanticElements).toContain("aside");
  });
});
