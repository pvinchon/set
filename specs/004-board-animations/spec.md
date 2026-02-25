# Feature Specification: Board Animations

**Feature Branch**: `004-board-animations`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "create animations when rendering the board, hovering cards, selecting cards, selecting a valid set, selecting an invalid set, rendering the new cards"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Initial Board Deal Animation (Priority: P1)

When a player starts a new game, the 12 cards on the board appear with a staggered entrance animation rather than all appearing instantly. Each card animates into view one after another with a short delay between them, creating a visually satisfying "dealing" effect.

**Why this priority**: The initial board render is the very first visual impression of the game. A smooth dealing animation communicates quality and sets the tone for the whole experience.

**Independent Test**: Start a new game and observe the board area. Cards should animate in one by one, each slightly delayed from the previous, rather than appearing all at once.

**Acceptance Scenarios**:

1. **Given** a new game is started, **When** the board renders for the first time, **Then** each of the 12 cards appears with a staggered entrance animation (e.g., fade-in and slide-up) with a visible delay between each card.
2. **Given** the initial deal animation is playing, **When** a card has not yet appeared, **Then** its board slot is visually empty or hidden until the card's turn in the sequence.
3. **Given** the initial deal animation is playing, **When** all 12 cards have finished animating in, **Then** the board is fully interactive and the player can begin selecting cards.

---

### User Story 2 - Card Hover & Active State Animation (Priority: P1)

When a player hovers over a card, the card provides immediate visual feedback (e.g., subtle lift, shadow increase, or slight scale-up) indicating it is interactive. When the player presses down on the card (active/tap state), the card responds with a pressed-in feel (e.g., slight scale-down or shadow reduction) before the click action fires. These micro-interactions make cards feel tactile and responsive.

**Why this priority**: Hover and active states are fundamental to making the interface feel interactive. Without them, cards appear static and unresponsive, degrading the overall feel of the game. They are also the first feedback a player receives before any selection.

**Independent Test**: Move the mouse cursor over a card and verify a visible hover effect appears (lift, shadow, or subtle scale). Press and hold on a card and verify a pressed/active effect appears. Release and verify the card returns to its normal or selected state.

**Acceptance Scenarios**:

1. **Given** a card is on the board, **When** the player hovers over it with a pointer device, **Then** the card displays a hover effect (e.g., slight upward lift and enhanced shadow) to indicate interactivity.
2. **Given** a card is being hovered, **When** the pointer leaves the card, **Then** the card smoothly returns to its resting visual state.
3. **Given** a card is on the board, **When** the player presses down on it (mousedown/touchstart), **Then** the card displays an active/pressed effect (e.g., slight scale-down or reduced shadow) to provide tactile feedback.
4. **Given** a card is in the active/pressed state, **When** the player releases (mouseup/touchend), **Then** the card transitions to its new state (selected or unselected) smoothly.
5. **Given** a card is already selected, **When** the player hovers over it, **Then** the hover effect is still visible but does not conflict with the selected visual state.

---

### User Story 3 - Card Selection Animation (Priority: P1)

When a player taps or clicks a card to select it, the card responds with a smooth visual transition indicating it is now selected. When tapping a selected card to deselect it, the card smoothly returns to its unselected appearance.

**Why this priority**: Selection feedback is part of the core gameplay loop. Every single interaction a player has with the game involves selecting cards, so this animation is experienced constantly and must feel responsive and polished.

**Independent Test**: Click a card on the board and verify it smoothly animates into its selected appearance (highlighted border, subtle lift/scale). Click it again and verify it smoothly animates back to normal.

**Acceptance Scenarios**:

1. **Given** a card is unselected, **When** the player clicks/taps it, **Then** the card transitions smoothly to its selected visual state (border color change, ring highlight, slight lift) rather than snapping instantly.
2. **Given** a card is selected, **When** the player clicks/taps it again, **Then** the card transitions smoothly back to its unselected visual state.
3. **Given** a card selection animation is playing, **When** it completes, **Then** the card remains stable in its new state with no flickering or visual glitch.

---

### User Story 4 - Valid Set Celebration Animation (Priority: P2)

When a player selects three cards that form a valid Set, the three selected cards display a success animation (e.g., a brief pulse, glow, or color flash in green) before being replaced with new cards. This provides clear positive feedback that the player found a correct Set.

**Why this priority**: Positive reinforcement for correct Sets is essential for player engagement and satisfaction. It rewards the player's pattern recognition and makes the game feel rewarding.

**Independent Test**: Select three cards that form a valid Set and observe a brief success animation (green highlight, pulse, or glow) on the three selected cards before they are replaced.

**Acceptance Scenarios**:

1. **Given** three selected cards form a valid Set, **When** validation succeeds, **Then** the three cards display a visible success animation (green accent, pulse or glow effect).
2. **Given** a valid Set success animation is playing, **When** the animation completes, **Then** the cards transition to the replacement step (see User Story 6).
3. **Given** a valid Set is found, **When** the success animation plays, **Then** player input is temporarily disabled until the animation and card replacement are complete to prevent conflicting interactions.

---

### User Story 5 - Invalid Set Rejection Animation (Priority: P2)

When a player selects three cards that do not form a valid Set, the three selected cards display an error animation (e.g., a shake and red flash) before being deselected. This provides clear negative feedback so the player understands their selection was incorrect.

**Why this priority**: Error feedback is critical for learning and gameplay clarity. Without a clear rejection animation, the player may not understand why their selection was cleared.

**Independent Test**: Select three cards that do not form a valid Set and observe a brief error animation (red highlight, shake) on the three selected cards before they return to their unselected state.

**Acceptance Scenarios**:

1. **Given** three selected cards do not form a valid Set, **When** validation fails, **Then** the three cards display a visible error animation (red accent, shake effect).
2. **Given** an invalid Set error animation is playing, **When** the animation completes, **Then** the three cards smoothly return to their unselected visual state.
3. **Given** an invalid Set rejection animation is playing, **When** a player tries to click other cards, **Then** input is temporarily disabled until the animation completes.

---

### User Story 6 - Card Replacement Animation (Priority: P2)

After a valid Set is found and the success animation completes, the three matched cards exit the board with a removal animation and three new cards enter the board in their positions with an entrance animation. This creates visual continuity and helps the player track which cards are new.

**Why this priority**: Without a replacement animation, cards swap instantly and the player loses spatial context. The animation helps the player identify which cards are new and maintain their mental map of the board.

**Independent Test**: After finding a valid Set and the success animation concludes, observe the three matched cards animate out (e.g., fade-out/scale-down) and three new cards animate in (e.g., fade-in/scale-up or slide-in) to their positions.

**Acceptance Scenarios**:

1. **Given** a valid Set success animation has completed, **When** the cards are replaced, **Then** the matched cards exit with a removal animation (e.g., fade-out, shrink, or slide-out).
2. **Given** matched cards have exited, **When** new cards are drawn, **Then** the new cards enter their board positions with an entrance animation (e.g., fade-in, grow, or slide-in).
3. **Given** card replacement animations are playing, **When** all new cards have finished animating in, **Then** the board becomes fully interactive again.
4. **Given** a card replacement sequence, **When** the new cards appear, **Then** the remaining (non-replaced) cards do not animate or shift unexpectedly.

---

### Edge Cases

- What happens if the player rapidly clicks multiple cards while an animation is still in progress? All clicks during blocking animations are silently dropped to prevent inconsistent state.
- What happens during a card replacement if the deck runs out of replacement cards? The removal animation should still play but no entrance animation occurs for the empty slots.
- What happens if the player resizes the browser window during an animation? Animations should complete gracefully without visual artifacts.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST animate cards onto the board with a staggered entrance effect when the initial board is rendered at game start.
- **FR-002**: System MUST provide a visible hover effect on cards when the player's pointer is over them, indicating interactivity.
- **FR-003**: System MUST provide a visible active/pressed effect on cards when the player presses down on them, providing tactile feedback.
- **FR-004**: System MUST animate the visual transition of a card when it is selected (from unselected to selected appearance).
- **FR-005**: System MUST animate the visual transition of a card when it is deselected (from selected to unselected appearance).
- **FR-006**: System MUST display a success animation (green visual feedback with pulse or glow) on three cards when a valid Set is confirmed.
- **FR-007**: System MUST display an error animation (red visual feedback with shake) on three cards when an invalid Set is detected.
- **FR-008**: System MUST animate the removal of matched cards from the board after a valid Set is confirmed.
- **FR-009**: System MUST animate the entrance of new replacement cards into the board positions vacated by matched cards.
- **FR-010**: System MUST silently ignore all card clicks during any blocking animation (initial deal, valid/invalid Set feedback, and card replacement). Clicks are dropped, not queued.
- **FR-011**: System MUST re-enable player input immediately after all animations in a sequence have completed.
- **FR-012**: System MUST ensure that non-replaced cards on the board remain visually stable (no movement, no re-animation) during card replacement animations.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All six animation types (initial deal, hover/active, selection, valid Set, invalid Set, card replacement) are visually distinct and clearly communicate their purpose to the player.
- **SC-002**: No single animation sequence exceeds 1.5 seconds total duration. Target timings: initial deal stagger 100ms per card (1.2s total), feedback animations (valid/invalid Set) 500ms, selection/exit/enter transitions 300ms each. A full valid-Set sequence (feedback + exit + enter) completes within 1.1 seconds.
- **SC-003**: Players can identify which cards are newly dealt after a Set is found, without confusion, due to the entrance animation distinguishing new cards from existing ones.
- **SC-004**: The game remains fully interactive (no frozen or unresponsive states) after every animation sequence completes.
- **SC-005**: Rapid player interactions (e.g., quick successive clicks) do not cause visual glitches, state corruption, or duplicate animations.

## Clarifications

### Session 2026-02-17

- Q: What animation timing profile should be used (uniform ~200ms, tiered fast, or slow & cinematic)? → A: Slow & cinematic: stagger 100ms/card (1.2s total deal), feedback animations 500ms, transitions 300ms.
- Q: How should input be handled during blocking animations (drop clicks, queue clicks, or partial lock)? → A: Silently drop all clicks during any blocking animation (deal, valid/invalid feedback, card replacement).
- Q: How should animations behave when `prefers-reduced-motion` is enabled (fully disable, crossfade only, or reduce duration)? → A: Not applicable — `prefers-reduced-motion` will not be handled in this feature. Proper user-level animation configuration will be implemented in a future feature.

## Assumptions

- The game already uses Tailwind CSS utility classes for styling. Animations will follow the same pattern of class-based styling.
- The existing `transition-all duration-150 ease-in-out` on cards is a foundation that can be extended for richer animation effects.
- The existing `animate-shake` class for invalid Sets is already partially implemented and can serve as a starting point.
- The game board always displays 12 cards (the standard Set game board size), so stagger delays can be calculated for a fixed count.
- The game runs in modern browsers that support CSS animations, transitions, and the `prefers-reduced-motion` media query.
- Animation timing profile is cinematic: stagger delays 100ms/card, feedback 500ms, transitions 300ms.
