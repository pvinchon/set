import lume from "lume/mod.ts";
import basePath from "lume/plugins/base_path.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";
import esbuild from "lume/plugins/esbuild.ts";
import pwa from "./src/pwa/plugin.ts";
import { isProduction } from "@/utils/environment.ts";

const site = lume({ src: "./src" });

site.data("isProduction", isProduction);

site.use(esbuild({
  extensions: [".ts"],
  options: {
    bundle: true,
    minify: true,
    target: "esnext",
  },
}));
site.use(tailwindcss({ minify: true }));
site.use(basePath());
site.use(pwa());

site.add("style.css");
site.add("game/main.ts", "game/main.js");

export default site;
