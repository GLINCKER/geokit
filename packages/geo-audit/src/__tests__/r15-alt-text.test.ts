import { describe, it, expect } from "vitest";
import { r15AltText } from "../rules/r15-alt-text.js";
import { mockPage } from "./helpers.js";

describe("R15: Image Alt Text Coverage", () => {
  it("passes when no images exist", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body><p>No images here</p></body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.totalImages).toBe(0);
  });

  it("passes when 100% of images have alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" alt="Image A" />
        <img src="b.jpg" alt="Image B" />
        <img src="c.jpg" alt="Image C" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.totalImages).toBe(3);
    expect(result.details?.imagesWithAlt).toBe(3);
    expect(result.details?.percentage).toBe(100);
  });

  it("passes when 90% of images have alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="1.jpg" alt="Image 1" />
        <img src="2.jpg" alt="Image 2" />
        <img src="3.jpg" alt="Image 3" />
        <img src="4.jpg" alt="Image 4" />
        <img src="5.jpg" alt="Image 5" />
        <img src="6.jpg" alt="Image 6" />
        <img src="7.jpg" alt="Image 7" />
        <img src="8.jpg" alt="Image 8" />
        <img src="9.jpg" alt="Image 9" />
        <img src="10.jpg" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.percentage).toBe(90);
  });

  it("warns when 75% of images have alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" alt="Image A" />
        <img src="b.jpg" alt="Image B" />
        <img src="c.jpg" alt="Image C" />
        <img src="d.jpg" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.totalImages).toBe(4);
    expect(result.details?.imagesWithAlt).toBe(3);
    expect(result.details?.percentage).toBe(75);
  });

  it("warns when 50% of images have alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" alt="Has alt" />
        <img src="b.jpg" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("warn");
    expect(result.score).toBe(3);
    expect(result.details?.percentage).toBe(50);
  });

  it("fails when less than 50% have alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" alt="Only this one" />
        <img src="b.jpg" />
        <img src="c.jpg" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.details?.totalImages).toBe(3);
    expect(result.details?.imagesWithAlt).toBe(1);
    expect(result.details?.percentage).toBe(33);
  });

  it("fails when no images have alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" />
        <img src="b.jpg" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.details?.percentage).toBe(0);
  });

  it("ignores images with role=presentation", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" alt="Real image" />
        <img src="decorative.jpg" role="presentation" />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("pass");
    expect(result.score).toBe(5);
    expect(result.details?.totalImages).toBe(1);
    expect(result.details?.imagesWithAlt).toBe(1);
  });

  it("treats empty alt as missing alt text", () => {
    const page = mockPage({
      html: `<!DOCTYPE html><html><body>
        <img src="a.jpg" alt="" />
        <img src="b.jpg" alt="   " />
      </body></html>`,
    });
    const result = r15AltText.check(page);
    expect(result.status).toBe("fail");
    expect(result.score).toBe(0);
    expect(result.details?.imagesWithAlt).toBe(0);
  });
});
