import { createRouter } from "@/screens/router.ts";
import { createPlayScreen } from "@/screens/play/component.ts";
import { createTitleScreen } from "@/screens/title/component.ts";

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    if (!app) return;

    // Build screen definitions — they reference each other via deferred callbacks.
    // deno-lint-ignore prefer-const
    let router: ReturnType<typeof createRouter>;

    const title = createTitleScreen(
      { navigateTo: (s) => router.navigateTo(s) },
      (difficulty) => play.start(difficulty),
    );

    const play = createPlayScreen(
      { navigateTo: (s) => router.navigateTo(s) },
      () => title.reset(),
    );

    router = createRouter(app, { title, play }, "title");
  });
}
