# Feature Specification: Set Card Game (Single Player)

**Feature Branch**: `003-set-card-game`  
**Created**: 2026-02-12  
**Status**: Draft  
**Input**: User description: "Build the following game as a single player experience: https://en.wikipedia.org/wiki/Set_(card_game)"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Find Sets on the Board (Priority: P1)

A player opens the game and sees 12 cards dealt face-up on the board. Each card displays a unique combination of four features: number (1, 2, or 3), shape (diamond, squiggle, oval), shading (solid, striped, open), and color (red, green, purple). The player visually scans the board, identifies three cards that form a valid "set", and selects them. A valid set requires that for each of the four features, the three selected cards are either all the same or all different. When a correct set is found, those three cards are removed and replaced with new cards from the deck.

**Why this priority**: This is the core gameplay loop -- without it there is no game. Everything else builds on top of being able to find and select sets.

**Independent Test**: Can be fully tested by dealing 12 cards and verifying the player can select 3 cards, receive feedback on validity, and see replacements dealt.

**Acceptance Scenarios**:

1. **Given** the game has started and 12 cards are displayed, **When** the player selects 3 cards that form a valid set, **Then** the cards are highlighted as correct, removed from the board, and 3 new cards are dealt from the deck.
2. **Given** the game has started and 12 cards are displayed, **When** the player selects 3 cards that do NOT form a valid set, **Then** the player is informed the selection is invalid and the cards are deselected.
3. **Given** the player has selected 1 or 2 cards, **When** the player taps an already-selected card, **Then** that card is deselected.
4. **Given** the player has selected 2 cards, **When** the player selects a 3rd card, **Then** the system immediately evaluates whether the 3 cards form a valid set.

---

### User Story 2 - A Valid Set Is Always Present (Priority: P1)

The 12 cards displayed on the board are guaranteed to always contain at least one valid set. When the player finds a set and those 3 cards are replaced, the system ensures the resulting board still contains at least one valid set. The player never encounters a dead-end board state.

**Why this priority**: Without this guarantee, the player could be stuck staring at a board with no solution, which breaks the core gameplay loop entirely.

**Independent Test**: Can be tested by verifying that after every card replacement, the board contains at least one valid set.

**Acceptance Scenarios**:

1. **Given** the game has just started, **When** the initial 12 cards are dealt, **Then** at least one valid set exists among them.
2. **Given** the player has found a valid set and 3 cards are removed, **When** 3 replacement cards are dealt, **Then** the resulting board of 12 cards contains at least one valid set.
3. **Given** replacement cards are being selected from the deck, **When** the first 3 candidates would result in a board with no valid set, **Then** the system selects different replacement cards that ensure a valid set exists.

---

### User Story 3 - Continuous Play (Priority: P1)

The game has no end state. The player can keep finding sets for as long as they want. After each valid set is found and cards are replaced, the game continues with a fresh board of 12 cards. The player plays at their own pace with no pressure to finish.

**Why this priority**: Defines the core session model -- the game is a relaxing, open-ended puzzle experience rather than a race to deplete a deck.

**Independent Test**: Can be tested by finding multiple sets in sequence and verifying the game never terminates or shows a game-over screen.

**Acceptance Scenarios**:

1. **Given** the player has found a valid set, **When** the 3 cards are replaced, **Then** the game continues with 12 cards on the board and the player can keep playing.
2. **Given** the player has been playing for an extended period, **When** they continue finding sets, **Then** the game keeps generating new replacement cards indefinitely.
3. **Given** the player wants to stop playing, **When** they leave or close the game, **Then** the session ends naturally with no summary or end screen required.

---

### User Story 4 - Start a New Game (Priority: P2)

At any point during the game, the player can choose to start fresh by refreshing the page. Since game state is held in memory only, a page refresh naturally deals a new board of 12 cards.

**Why this priority**: Essential for replayability and for when the player wants a fresh board.

**Independent Test**: Can be tested by refreshing the page mid-game and verifying a fresh board is dealt.

**Acceptance Scenarios**:

1. **Given** a game is in progress, **When** the player refreshes the page, **Then** 12 new cards are dealt with at least one valid set guaranteed.
2. **Given** the player has found several sets, **When** they refresh, **Then** the previous board state is discarded and a completely new board is shown.

---

### Edge Cases

- What happens when the player selects the same card twice? The card is deselected (toggled).
- What happens if replacement cards would result in no valid set? The system picks different replacement cards to guarantee at least one valid set exists.
- What happens during rapid selection? The system processes one selection at a time and prevents race conditions in the evaluation logic.
- What happens if the player closes the browser? The session ends; no state is persisted.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST generate cards with a unique combination of 4 features (number: 1/2/3, shape: diamond/squiggle/oval, shading: solid/striped/open, color: red/green/purple).
- **FR-002**: System MUST deal 12 cards face-up onto the board at game start.
- **FR-003**: System MUST guarantee that at least one valid set exists among the 12 cards on the board at all times.
- **FR-004**: System MUST allow the player to select and deselect individual cards by tapping or clicking them.
- **FR-005**: System MUST visually indicate which cards are currently selected.
- **FR-006**: System MUST automatically evaluate whether 3 selected cards form a valid set once 3 cards are selected.
- **FR-007**: System MUST validate sets using the rule: for each of the 4 features, the 3 cards must be either all the same or all different.
- **FR-008**: System MUST remove valid sets from the board and replace them with 3 new cards, ensuring the resulting board still contains at least one valid set.
- **FR-009**: System MUST provide clear visual feedback for valid set selections (success) and invalid selections (error).
- **FR-010**: System MUST allow the player to continue playing indefinitely -- there is no game-over condition.
- **FR-011**: System MUST allow the player to start a new game by refreshing the page.
- **FR-012**: Each card MUST be visually distinct, clearly rendering its number, shape, shading, and color so players can quickly identify features.

### Key Entities

- **Card**: A card with four features: number (1, 2, 3), shape (diamond, squiggle, oval), shading (solid, striped, open), color (red, green, purple). Each unique combination of features defines a distinct card.
- **Board**: The set of 12 face-up cards currently in play. Always contains at least one valid set.
- **Set**: A combination of exactly 3 cards where, for each of the 4 features, the values are either all the same or all different across the 3 cards.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Players can start a new game and see the initial board of cards within 2 seconds.
- **SC-002**: Players receive feedback on whether their 3-card selection is a valid set within 1 second of selection.
- **SC-003**: Players can play continuously without the game ever reaching a dead-end or ending involuntarily.
- **SC-004**: 90% of first-time players can find their first valid set within 3 minutes of starting a game.
- **SC-005**: Players can read and distinguish all four features of every card at a glance, without confusion or misidentification.
- **SC-006**: The game correctly identifies all valid sets on any board configuration with 100% accuracy (no false positives or false negatives in set validation).
- **SC-007**: Players can start a fresh game by refreshing the page.

## Assumptions

- The game targets a single player only -- no multiplayer, competitive, or networked features are in scope.
- The game runs in a web browser as part of the existing site infrastructure.
- No persistent data storage is needed -- game state exists only for the current session and is not saved across page reloads.
- Cards use the standard Set game features (diamond/squiggle/oval shapes, solid/striped/open shading, red/green/purple colors) rendered graphically.
- The board always has exactly 12 cards. There is no concept of a finite deck that depletes -- the system generates replacement cards as needed.
- There is no game-over condition, no timer, no score tracking, no hints, and no deck-remaining indicator. The experience is open-ended.
- Keyboard navigation and accessibility features beyond standard semantic markup are out of scope.
- The game does not include a tutorial or onboarding flow -- players are assumed to know the rules of Set.
- Performance targets assume a modern browser on desktop or mobile.
