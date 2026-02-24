import {
  assert,
  assertNotMatch,
  assertStringIncludes,
} from "jsr:@std/assert@1";
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

Deno.test("index.html contains app container", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, 'id="app"');
});

Deno.test("index.html contains game script tag", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, "/game/main.js");
});

Deno.test("index.html does not contain Hello World", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertNotMatch(html, /Hello,?\s*World/i);
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

// --- PWA: Service Worker tests (T010) ---

Deno.test("build produces _site/service_worker.js", async () => {
  assert(
    await exists(`${SITE_DIR}/service_worker.js`),
    "_site/service_worker.js should exist after build",
  );
});

Deno.test("service_worker.js is non-empty", async () => {
  const sw = await Deno.readTextFile(`${SITE_DIR}/service_worker.js`);
  assert(sw.length > 0, "service_worker.js should not be empty");
});

Deno.test("service_worker.js does not contain __PRECACHE_URLS__ placeholder", async () => {
  const sw = await Deno.readTextFile(`${SITE_DIR}/service_worker.js`);
  assertNotMatch(sw, /__PRECACHE_URLS__/);
});

Deno.test("service_worker.js does not contain __CACHE_NAME__ placeholder", async () => {
  const sw = await Deno.readTextFile(`${SITE_DIR}/service_worker.js`);
  assertNotMatch(sw, /__CACHE_NAME__/);
});

Deno.test("service_worker.js precache list includes root and style.css", async () => {
  const sw = await Deno.readTextFile(`${SITE_DIR}/service_worker.js`);
  assertStringIncludes(sw, '"/"');
  assertStringIncludes(sw, '"/style.css"');
});

// --- PWA: Cache versioning test (T011) ---

Deno.test("two builds produce different CACHE_NAME values", async () => {
  await runBuild();
  const sw1 = await Deno.readTextFile(`${SITE_DIR}/service_worker.js`);
  const match1 = sw1.match(/const CACHE_NAME = "(.+?)"/);
  assert(match1, "First build should contain CACHE_NAME");

  // Small delay to ensure different timestamp
  await new Promise((r) => setTimeout(r, 10));

  await runBuild();
  const sw2 = await Deno.readTextFile(`${SITE_DIR}/service_worker.js`);
  const match2 = sw2.match(/const CACHE_NAME = "(.+?)"/);
  assert(match2, "Second build should contain CACHE_NAME");

  assert(
    match1![1] !== match2![1],
    `CACHE_NAME should differ between builds: "${match1![1]}" vs "${
      match2![1]
    }"`,
  );
});

// --- PWA: Manifest tests (T014) ---

Deno.test("build produces _site/manifest.webmanifest", async () => {
  assert(
    await exists(`${SITE_DIR}/manifest.webmanifest`),
    "_site/manifest.webmanifest should exist after build",
  );
});

Deno.test("manifest.webmanifest has required fields", async () => {
  const raw = await Deno.readTextFile(`${SITE_DIR}/manifest.webmanifest`);
  const manifest = JSON.parse(raw);
  assert(manifest.name, "manifest should have name");
  assert(manifest.short_name, "manifest should have short_name");
  assert(manifest.start_url, "manifest should have start_url");
  assert(manifest.display, "manifest should have display");
  assert(
    Array.isArray(manifest.icons) && manifest.icons.length >= 4,
    "manifest should have at least 4 icons",
  );

  const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
  assert(sizes.includes("192x192"), "manifest should include 192x192 icon");
  assert(sizes.includes("512x512"), "manifest should include 512x512 icon");
});

// --- PWA: Icon file tests (T015) ---

Deno.test("build produces icon-192.png", async () => {
  assert(await exists(`${SITE_DIR}/icons/icon-192.png`));
});

Deno.test("build produces icon-512.png", async () => {
  assert(await exists(`${SITE_DIR}/icons/icon-512.png`));
});

Deno.test("build produces icon-maskable-192.png", async () => {
  assert(await exists(`${SITE_DIR}/icons/icon-maskable-192.png`));
});

Deno.test("build produces icon-maskable-512.png", async () => {
  assert(await exists(`${SITE_DIR}/icons/icon-maskable-512.png`));
});

// --- PWA: HTML injection tests (T016) ---

Deno.test("index.html contains manifest link", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, 'rel="manifest"');
});

Deno.test("index.html contains apple-touch-icon", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, "apple-touch-icon");
});

Deno.test("index.html contains theme-color", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, "theme-color");
});

Deno.test("index.html contains serviceWorker registration", async () => {
  const html = await Deno.readTextFile(`${SITE_DIR}/index.html`);
  assertStringIncludes(html, "serviceWorker");
});
