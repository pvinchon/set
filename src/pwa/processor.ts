import { Data, Page } from "lume/core/file.ts";
import Site from "lume/core/site.ts";

/**
 * Lume process hook that injects the precache URL list and a
 * cache-busting cache name into service_worker.js at build time.
 */
export default function processor(site: Site, pages: Page<Data>[]): void {
  for (const page of pages) {
    if (page.data.url !== "/service_worker.js") continue;

    // Collect all output URLs (pages + static files), excluding service_worker.js
    const urls: string[] = [];
    for (const p of site.pages) {
      const url = p.data.url as string;
      if (url && url !== "/service_worker.js") {
        urls.push(url);
      }
    }
    for (const f of site.files) {
      const url = f.data.url as string;
      if (url && url !== "/service_worker.js" && !urls.includes(url)) {
        urls.push(url);
      }
    }

    const cacheName = `set-v${Date.now()}`;

    // Static files added via site.add() have Uint8Array content
    let content: string;
    if (page.content instanceof Uint8Array) {
      content = new TextDecoder().decode(page.content);
    } else {
      content = page.content as string;
    }

    content = content.replace('"__CACHE_NAME__"', `"${cacheName}"`);
    content = content.replace("__PRECACHE_URLS__", JSON.stringify(urls));
    page.content = content;
  }
}
