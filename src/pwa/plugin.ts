import { Data, Page } from "lume/core/file.ts";
import Site from "lume/core/site.ts";

export default function plugin() {
  return (site: Site) => {
    site.add("pwa/src/service_worker.js", "service_worker.js");
    site.add("pwa/src/manifest.webmanifest.vto", "manifest.webmanifest");
    site.add("pwa/src/icons", "icons");

    site.process([".js"], (pages) => {
      const serviceWorker = pages.find((p) =>
        p.data.url === "/service_worker.js"
      )!;
      updateServiceWorkerText(serviceWorker, site);
    });
  };
}

function updateServiceWorkerText(
  serviceWorkerPage: Page<Data>,
  site: Site,
): void {
  const pageUrls = site.pages.map((page) => page.data.url);
  const filesUrls = site.files.map((file) => file.data.url);

  const urls = [...pageUrls, ...filesUrls]
    .filter((url) => url !== "/service_worker.js")
    .map((url) => site.url(url));

  serviceWorkerPage.text = serviceWorkerPage.text
    .replace("__CACHE_NAME__", `set-v${Date.now()}`)
    .replace("__CACHE_URLS__", JSON.stringify(urls));
}
