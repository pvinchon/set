import { assertEquals } from "jsr:@std/assert@1";
import { clearSelection, isComplete, toggleSelection } from "./actions.ts";
import { EMPTY_SELECTION } from "./model.ts";

Deno.test("toggleSelection adds index to empty selection", () => {
  const result = toggleSelection(EMPTY_SELECTION, 5);

  assertEquals(result.indices, [5]);
});

Deno.test("toggleSelection removes index when already selected", () => {
  const selection = { indices: [2, 5, 8] };
  const result = toggleSelection(selection, 5);

  assertEquals(result.indices, [2, 8]);
});

Deno.test("toggleSelection adds second index", () => {
  const selection = { indices: [3] };
  const result = toggleSelection(selection, 7);

  assertEquals(result.indices, [3, 7]);
});

Deno.test("toggleSelection adds third index", () => {
  const selection = { indices: [1, 4] };
  const result = toggleSelection(selection, 9);

  assertEquals(result.indices, [1, 4, 9]);
});

Deno.test("toggleSelection ignores fourth selection attempt", () => {
  const selection = { indices: [1, 4, 9] };
  const result = toggleSelection(selection, 2);

  // Returns original selection unchanged
  assertEquals(result, selection);
  assertEquals(result.indices, [1, 4, 9]);
});

Deno.test("toggleSelection allows deselect when at 3", () => {
  const selection = { indices: [1, 4, 9] };
  const result = toggleSelection(selection, 4);

  assertEquals(result.indices, [1, 9]);
});

Deno.test("clearSelection returns empty selection", () => {
  const result = clearSelection();

  assertEquals(result, EMPTY_SELECTION);
  assertEquals(result.indices, []);
});

Deno.test("isComplete returns false for empty selection", () => {
  assertEquals(isComplete(EMPTY_SELECTION), false);
});

Deno.test("isComplete returns false for 1 card", () => {
  assertEquals(isComplete({ indices: [5] }), false);
});

Deno.test("isComplete returns false for 2 cards", () => {
  assertEquals(isComplete({ indices: [5, 8] }), false);
});

Deno.test("isComplete returns true for 3 cards", () => {
  assertEquals(isComplete({ indices: [1, 5, 8] }), true);
});
