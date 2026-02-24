import type { DifficultyLevel } from "@/game/difficulty/mod.ts";
import type { Router, ScreenDef } from "@/screens/router.ts";

const BUTTON_CLASSES = [
  "rounded-lg",
  "px-6",
  "py-3",
  "text-lg",
  "font-semibold",
  "text-white",
  "shadow-md",
  "transition-colors",
];
const BUTTON_LEVELS: {
  level: DifficultyLevel;
  label: string;
  classes: string;
}[] = [
  {
    level: "easy" as DifficultyLevel,
    label: "Easy",
    classes: [
      ...BUTTON_CLASSES,
      "bg-[#648fff]",
      "hover:bg-[#5a80e6]",
      "active:bg-[#4f70cc]",
    ].join(" "),
  },
  {
    level: "normal" as DifficultyLevel,
    label: "Normal",
    classes: [
      ...BUTTON_CLASSES,
      "bg-[#ffb000]",
      "hover:bg-[#e69e00]",
      "active:bg-[#cc8d00]",
    ].join(" "),
  },
  {
    level: "hard" as DifficultyLevel,
    label: "Hard",
    classes: [
      ...BUTTON_CLASSES,
      "bg-[#dc267f]",
      "hover:bg-[#c62272]",
      "active:bg-[#b01e65]",
    ].join(" "),
  },
];

function createButton(
  level: DifficultyLevel,
  label: string,
  classes: string,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.dataset.difficulty = level;
  btn.className = classes;
  btn.textContent = label;
  return btn;
}

export interface TitleScreen {
  /** Re-enable difficulty buttons after returning from a game. */
  reset(): void;
}

/**
 * Create a title screen definition for the router.
 *
 * When a difficulty button is clicked, the router navigates to the play
 * screen and `onStart` is called with the selected difficulty.
 */
export function createTitleScreen(
  router: Router,
  onStart: (difficulty: DifficultyLevel) => void,
): ScreenDef & TitleScreen {
  let started = false;

  return {
    create() {
      const root = document.createElement("div");
      root.className = "flex flex-col items-center gap-8";

      const h1 = document.createElement("h1");
      h1.className = "text-5xl font-bold text-gray-900";
      h1.textContent = "SET";
      root.appendChild(h1);

      const group = document.createElement("div");
      group.className = "mt-7 flex flex-col gap-3 w-full max-w-xs";

      for (const { level, label, classes } of BUTTON_LEVELS) {
        const btn = createButton(level, label, classes);
        btn.addEventListener("click", () => {
          if (started) return;
          started = true;
          router.navigateTo("play");
          onStart(level);
        });
        group.appendChild(btn);
      }

      root.appendChild(group);
      return root;
    },

    reset() {
      started = false;
    },
  };
}
