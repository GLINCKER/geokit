import { describe, it, expect } from "vitest";
import { r20Viewport } from "../rules/r20-viewport.js";
import { mockPage } from "./helpers.js";

describe("R20: Mobile Viewport Meta Tag", () => {
  it("passes when viewport has width=device-width", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
    expect(result.message).toContain("properly configured");
  });

  it("passes with width=device-width and other properties", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });

  it("passes with minimal viewport config", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });

  it("warns when viewport exists but no width=device-width", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="initial-scale=1">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(1);
    expect(result.message).toContain("missing width=device-width");
  });

  it("warns when viewport has fixed width", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=1024">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(1);
  });

  it("fails when no viewport meta tag found", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.message).toContain("No viewport meta tag found");
  });

  it("fails when viewport meta is empty", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(1);
  });

  it("handles multiple viewport tags (uses first)", () => {
    const page = mockPage({
      html: `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="viewport" content="width=1024">
</head>
<body></body>
</html>`,
    });
    const result = r20Viewport.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(3);
  });
});
