import { describe, it, expect } from "vitest";
import { r12ContentType } from "../rules/r12-content-type.js";
import { mockPage } from "./helpers.js";

describe("R12: Content-Type & Encoding", () => {
  it("passes with proper content-type and compression", () => {
    const page = mockPage({
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-encoding": "gzip",
      },
    });
    const result = r12ContentType.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
  });

  it("warns with no compression", () => {
    const page = mockPage({
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
    const result = r12ContentType.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
  });

  it("warns with no charset", () => {
    const page = mockPage({
      headers: {
        "content-type": "text/html",
        "content-encoding": "br",
      },
    });
    const result = r12ContentType.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(4);
  });

  it("fails with wrong content-type", () => {
    const page = mockPage({
      headers: {
        "content-type": "application/json",
      },
    });
    const result = r12ContentType.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
  });
});
