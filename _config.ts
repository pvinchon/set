import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import pwa from "./src/pwa/plugin.ts";

const site = lume({ src: "./src" });

site.use(tailwindcss({ minify: true }));
site.use(basePath());
site.use(pwa());

site.add("style.css");

export default site;
