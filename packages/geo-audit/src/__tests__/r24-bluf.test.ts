import { describe, it, expect } from "vitest";
import { r24Bluf } from "../rules/r24-bluf.js";
import { mockPage } from "./helpers.js";

describe("R24: BLUF / Answer Capsule", () => {
  it("passes with strong opening paragraph", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <main>
    <h1>What is TypeScript?</h1>
    <p>TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds optional static typing to JavaScript, which can help catch errors early through a type system and make your code more reliable and maintainable.</p>
    <p>More details here...</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(8);
    expect(result.details?.wordCount).toBeGreaterThan(15);
    expect(result.details?.wordCount).toBeLessThan(300);
  });

  it("fails when no paragraphs found", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <h1>Title</h1>
  <div>Only divs here</div>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("No content paragraphs found");
  });

  it("warns when first paragraph is too short", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <main>
    <p>TypeScript is great.</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.wordCount).toBeLessThan(15);
  });

  it("warns when first paragraph is too long", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <main>
    <p>${"Lorem ipsum dolor sit amet consectetur. ".repeat(60)}</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(4);
    expect(result.details?.wordCount).toBeGreaterThan(300);
  });

  it("warns when first paragraph is filler (welcome)", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <main>
    <p>Welcome to our website! We're glad you're here. Please explore our content and enjoy your stay.</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
    expect(result.message).toContain("filler content");
  });

  it("warns when first paragraph is cookie consent", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <main>
    <p>We use cookies to improve your experience on our site. By continuing to browse, you accept our use of cookies.</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(2);
  });

  it("skips nav and header elements", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <nav>
    <p>Skip to main content</p>
  </nav>
  <header>
    <p>Welcome to our site</p>
  </header>
  <main>
    <p>TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. It adds optional static typing to JavaScript.</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(8);
    expect(result.details?.preview).toContain("TypeScript is a strongly");
  });

  it("includes preview in details", () => {
    const html = `<!DOCTYPE html>
<html>
<body>
  <main>
    <p>This is a well-crafted opening paragraph that provides a clear and direct answer to the user's likely question about our product or service. It should be informative and helpful.</p>
  </main>
</body>
</html>`;
    const page = mockPage({ html });
    const result = r24Bluf.check(page);
    expect(result.details?.preview).toBeDefined();
    expect(result.details?.preview?.length).toBeLessThanOrEqual(120);
  });
});
