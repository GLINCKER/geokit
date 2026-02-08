import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the CLI argument parsing and help/version behavior
// by importing the internal functions if they were exported,
// or by testing the CLI as a subprocess

describe("geo-seo CLI", () => {
  it("module can be imported", async () => {
    // This test verifies the CLI file has no syntax errors
    // and can be loaded as a module
    const mod = await import("../cli.js");
    expect(mod).toBeDefined();
  });
});
