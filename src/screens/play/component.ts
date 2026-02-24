import { mountBoard, unmountBoard } from "@/game/board/mod.ts";
import type { DifficultyLevel } from "@/game/difficulty/mod.ts";
import type { Router, ScreenDef } from "@/screens/router.ts";

export interface PlayScreen {
  /** Start a game with the given difficulty. */
  start(difficulty: DifficultyLevel): void;
}

/**
 * Create a play screen definition for the router.
 *
 * Composes the game board and a back button. The back button unmounts
 * the board and navigates back to the title screen via the router.
 */
export function createPlayScreen(
  router: Router,
  onBack?: () => void,
): ScreenDef & PlayScreen {
  let boardEl: HTMLElement | null = null;
  let pendingDifficulty: DifficultyLevel | null = null;

  return {
    create() {
      const root = document.createElement("div");
      root.className = "flex flex-col items-center w-full min-h-screen";

      // Header bar with back button — pinned to top
      const header = document.createElement("div");
      header.className = "flex w-full max-w-screen-sm items-center pt-4 px-4";

      const backBtn = document.createElement("button");
      backBtn.className =
        "text-gray-500 hover:text-gray-700 transition-colors font-medium";
      backBtn.textContent = "\u2190 back";
      backBtn.addEventListener("click", () => {
        if (boardEl) unmountBoard(boardEl);
        router.navigateTo("title");
        onBack?.();
      });
      header.appendChild(backBtn);
      root.appendChild(header);

      // Board container — centered in remaining space
      const boardWrapper = document.createElement("div");
      boardWrapper.className =
        "flex-1 flex items-center justify-center w-full p-4";

      const board = document.createElement("div");
      board.id = "game-board";
      board.className = "grid gap-4 max-w-screen-sm w-full";
      boardWrapper.appendChild(board);
      root.appendChild(boardWrapper);

      boardEl = board;
      return root;
    },

    onMount() {
      if (pendingDifficulty && boardEl) {
        mountBoard(boardEl, pendingDifficulty);
        pendingDifficulty = null;
      }
    },

    onUnmount() {
      if (boardEl) unmountBoard(boardEl);
      boardEl = null;
    },

    start(difficulty: DifficultyLevel) {
      if (boardEl) {
        mountBoard(boardEl, difficulty);
      } else {
        // Board not yet in DOM — defer until onMount
        pendingDifficulty = difficulty;
      }
    },
  };
}
