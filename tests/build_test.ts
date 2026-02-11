import { assert, assertStringIncludes } from "jsr:@std/assert@1";
import { exists } from "jsr:@std/fs@1/exists";

const SITE_DIR = "_site";

/** Helper: run the Lume build and wait for it to complete. */
async function runBuild(): Promise<void> {
  const command = new Deno.Command("deno", {
    args: ["task", "build"],
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stderr } = await command.output();
  if (code !== 0) {
    const errText = new TextDecoder().decode(stderr);
    throw new Error(`Build failed (exit ${code}):\n${errText}`);
  }
}

Deno.test("build produces _site/index.html", async () => {
  await runBuild();
  assert(
    await exists(`${SITE_DIR}/index.html`),
    "_site/index.html should exist after build",
  );
});

Deno.test("index.html contains 'Hello, World!'", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, "Hello, World!");
});

Deno.test("build produces _site/style.css", async () => {
  assert(
    await exists(`${SITE_DIR}/style.css`),
    "_site/style.css should exist after build",
  );
});

Deno.test("style.css is non-empty", async () => {
  const css = await Deno.readTextFile(`${SITE_DIR}/style.css`);
  assert(css.length > 0, "style.css should not be empty");
});
