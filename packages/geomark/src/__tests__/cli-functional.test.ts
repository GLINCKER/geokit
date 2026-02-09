import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { exec as execAsync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, rmSync, existsSync } from "node:fs";
import { promisify } from "node:util";

const exec = promisify(execAsync);

describe("geomark CLI functional tests", () => {
  let server: any;
  const port = 3888;
  const baseUrl = `http://localhost:${port}`;

  beforeAll(async () => {
    server = createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <head><title>CLI Test Page</title></head>
          <body>
            <article>
              <h1>Heading 1</h1>
              <p>Hello from the CLI test server.</p>
            </article>
          </body>
        </html>
      `);
    });
    await new Promise<void>((resolve) => {
      server.listen(port, "127.0.0.1", resolve);
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(resolve);
    });
  });

  const cli = "GEOMARK_ALLOW_LOCAL=1 node dist/cli.js";

  it("outputs markdown to stdout by default", async () => {
    const { stdout } = await exec(`${cli} ${baseUrl}`);
    expect(stdout).toContain("# Heading 1");
    expect(stdout).toContain("Hello from the CLI test server.");
  });

  it("outputs JSON when --json flag is used", async () => {
    const { stdout } = await exec(`${cli} ${baseUrl} --json`);
    const json = JSON.parse(stdout);
    expect(json.title).toBe("CLI Test Page");
    expect(json.markdown).toContain("# Heading 1");
  });

  it("includes frontmatter when --frontmatter flag is used", async () => {
    const { stdout } = await exec(`${cli} ${baseUrl} --frontmatter`);
    expect(stdout).toMatch(/^---\n/);
    expect(stdout).toContain('title: "CLI Test Page"');
    expect(stdout).toContain("\n---\n");
  });

  it("saves to file when --output flag is used", async () => {
    const outFile = "cli-test-output.md";
    if (existsSync(outFile)) rmSync(outFile);
    
    await exec(`${cli} ${baseUrl} -o ${outFile}`);
    expect(existsSync(outFile)).toBe(true);
    const content = readFileSync(outFile, "utf-8");
    expect(content).toContain("Heading 1");
    
    rmSync(outFile);
  });

  it("takes input from stdin", async () => {
    const { stdout } = await exec(`echo "${baseUrl}" | ${cli}`);
    expect(stdout).toContain("# Heading 1");
  });
});
