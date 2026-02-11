import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import processor from "./src/pwa/processor.ts";

const site = lume({ src: "./src" });

site.use(tailwindcss({ minify: true }));
site.use(basePath());

site.add("style.css");
site.add("pwa/src/service_worker.js", "service_worker.js");
site.add("pwa/src/manifest.webmanifest", "manifest.webmanifest");
site.add("pwa/src/icons", "icons");

site.process([".js"], (pages) => processor(site, pages));

export default site;
