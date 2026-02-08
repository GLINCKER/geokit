import { describe, it, expect } from "vitest";

describe("geomark CLI", () => {
  it("module can be imported", async () => {
    const mod = await import("../cli.js");
    expect(mod).toBeDefined();
  });
});
