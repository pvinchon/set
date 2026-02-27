# Feature Specification: Title Screen with Difficulty Selection

**Feature Branch**: `005-title-screen-difficulty`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "A title screen to start the game in easy, medium, or hard"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Choose Difficulty and Start Game (Priority: P1)

A player opens the game and is presented with a title screen instead of immediately seeing the board. The title screen displays the game name and three clearly labeled difficulty options: Easy, Normal, and Hard. The player selects their preferred difficulty, and the game begins with settings corresponding to that difficulty level. Until a difficulty is chosen, no cards are dealt and no game board is visible.

**Why this priority**: This is the core feature -- without it, the title screen has no purpose. The player must be able to choose a difficulty and transition into gameplay.

**Independent Test**: Can be fully tested by opening the game, verifying the title screen appears with three difficulty buttons, selecting each one, and confirming the game starts with the appropriate settings.

**Acceptance Scenarios**:

1. **Given** the player opens the game, **When** the page loads, **Then** a title screen is displayed with the game name and three difficulty options: Easy, Normal, and Hard.
2. **Given** the title screen is displayed, **When** the player selects "Easy", **Then** the title screen disappears and the game begins with Easy difficulty settings.
3. **Given** the title screen is displayed, **When** the player selects "Normal", **Then** the title screen disappears and the game begins with Normal difficulty settings.
4. **Given** the title screen is displayed, **When** the player selects "Hard", **Then** the title screen disappears and the game begins with Hard difficulty settings.
5. **Given** the title screen is displayed, **When** the player has not yet selected a difficulty, **Then** no cards are dealt and the game board is not visible.

---

### User Story 2 - Difficulty Affects Gameplay (Priority: P1)

Each difficulty level changes the game experience by adjusting two parameters: the number of cards on the board and the number of attributes per card. Easy uses fewer cards and fewer attributes, making patterns easier to spot. Normal uses the standard 12-card board with 3 attributes. Hard uses 12 cards with all 4 attributes (number, shape, shading, and color), requiring the player to evaluate more dimensions simultaneously.

- **Easy**: 9 cards on the board, 3 attributes per card
- **Normal**: 12 cards on the board, 3 attributes per card
- **Hard**: 12 cards on the board, 4 attributes per card

**Why this priority**: Without distinct gameplay differences, the difficulty selection is meaningless. The player needs to feel a real difference between Easy, Normal, and Hard for the feature to deliver value.

**Independent Test**: Can be tested by starting a game on each difficulty and verifying the correct number of cards is dealt and cards display the correct number of attributes.

**Acceptance Scenarios**:

1. **Given** the player starts a game on Easy, **When** the board is dealt, **Then** 9 cards are displayed, each with 3 attributes.
2. **Given** the player starts a game on Normal, **When** the board is dealt, **Then** 12 cards are displayed, each with 3 attributes.
3. **Given** the player starts a game on Hard, **When** the board is dealt, **Then** 12 cards are displayed, each with 4 attributes (the full standard Set game).
4. **Given** the player finds a valid set on Easy and 3 cards are removed, **When** replacement cards are dealt, **Then** the board returns to 9 cards, each with 3 attributes.
5. **Given** the player finds a valid set on Normal or Hard and 3 cards are removed, **When** replacement cards are dealt, **Then** the board returns to 12 cards with the appropriate number of attributes.
6. **Given** the player is on any difficulty, **When** they find a valid set, **Then** the set is validated using only the attributes active for that difficulty level.

---

### User Story 3 - Return to Title Screen (Priority: P2)

While playing, the player can return to the title screen to select a different difficulty or start fresh. A clearly visible option takes the player back to the title screen, discarding the current game state.

**Why this priority**: Essential for replayability -- players who want to switch difficulty or restart should not have to refresh the page. This replaces the current "refresh to restart" behavior with a more intentional flow.

**Independent Test**: Can be tested by starting a game, using the return option, confirming the title screen reappears, and starting a new game with a different difficulty.

**Acceptance Scenarios**:

1. **Given** a game is in progress, **When** the player activates the return-to-title option, **Then** the game board is hidden, the current game state is discarded, and the title screen is displayed.
2. **Given** the player has returned to the title screen, **When** they select a difficulty, **Then** a new game begins with that difficulty -- no state from the previous game carries over.

---

### Edge Cases

- What happens if the player refreshes the page during a game? The title screen is shown again and the player must select a difficulty to start a new game.
- What happens if the player rapidly clicks multiple difficulty buttons? Only the first selection is processed; subsequent clicks are ignored until the game has fully initialized.
- What happens if the player clicks the return-to-title option during a card animation? The animation completes or is interrupted gracefully, then the title screen is shown.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a title screen when the game page is loaded, before any cards are dealt.
- **FR-002**: Title screen MUST display the game name ("Set") prominently.
- **FR-003**: Title screen MUST present exactly three difficulty options labeled "Easy", "Normal", and "Hard".
- **FR-004**: Each difficulty option MUST be clearly distinguishable and easy to tap/click on both desktop and mobile.
- **FR-005**: System MUST NOT deal any cards or show the game board until the player selects a difficulty.
- **FR-006**: System MUST transition from the title screen to the game board when a difficulty is selected.
- **FR-007**: System MUST configure the board size based on the selected difficulty -- Easy deals 9 cards, Normal and Hard deal 12 cards.
- **FR-008**: System MUST configure the number of active attributes based on the selected difficulty -- Easy and Normal use 3 attributes, Hard uses 4 attributes.
- **FR-009**: System MUST validate sets using only the attributes active for the current difficulty level.
- **FR-010**: System MUST maintain the correct board size after every card replacement during gameplay.
- **FR-011**: System MUST provide a visible option during gameplay for the player to return to the title screen.
- **FR-012**: When the player returns to the title screen, system MUST discard all current game state.
- **FR-013**: System MUST show the title screen again when the page is refreshed.
- **FR-014**: System MUST guarantee at least one valid set exists on the board at all times, regardless of difficulty level.

### Key Entities

- **Title Screen**: The initial view presented to the player, containing the game name and difficulty selection options. Acts as the entry point to gameplay.
- **Difficulty Level**: A game configuration that determines the number of cards on the board and the number of attributes per card. Three levels exist: Easy (9 cards, 3 attributes), Normal (12 cards, 3 attributes), Hard (12 cards, 4 attributes).
- **Board** (extended): The set of face-up cards in play, with a configurable card count (9 or 12) and attribute count (3 or 4) based on the selected difficulty. Always contains at least one valid set.
- **Attribute**: A feature dimension used for set validation. The four possible attributes are number, shape, shading, and color. Easy and Normal fix number to 1, using shape, shading, and color as the 3 active attributes; Hard uses all 4.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Players see the title screen and can select a difficulty within 2 seconds of page load.
- **SC-002**: The game board appears within 1 second of selecting a difficulty.
- **SC-003**: 95% of players can identify and select their desired difficulty on the first attempt without confusion.
- **SC-004**: Players on Easy difficulty find their first valid set faster on average than players on Hard difficulty, due to fewer cards and fewer attributes to evaluate.
- **SC-005**: Players can return to the title screen and start a new game with a different difficulty within 3 seconds.
- **SC-006**: The board always displays the correct number of cards for the selected difficulty (9 for Easy, 12 for Normal and Hard) with 100% consistency.
- **SC-007**: Set validation uses exactly the number of attributes defined for the selected difficulty (3 for Easy/Normal, 4 for Hard) with 100% accuracy.

## Assumptions

- The game currently starts immediately on page load with no title screen -- this feature adds the title screen as an intermediary step.
- The current game behavior (12 cards, 4 attributes) maps to "Hard" difficulty.
- Easy and Normal reduce complexity by using fewer attributes (3 instead of 4). Easy further reduces complexity by using a smaller board (9 cards instead of 12).
- When 3 attributes are used, the number attribute is fixed to a single value (`Num.A` = 1 shape per card). Shape, shading, and color remain as the 3 active attributes.
- No persistent storage of difficulty preference is needed -- the player selects difficulty each time they visit or return to the title screen.
- The title screen replaces the current "refresh to restart" pattern with an explicit return-to-title flow, though refreshing the page also returns to the title screen.
- The visual design of the title screen is consistent with the existing game aesthetics (clean, minimal, using the same color palette and styling approach).
- No tutorial, rules explanation, or onboarding content is included on the title screen -- it shows the game name and difficulty buttons only.
- The difficulty names "Easy", "Normal", and "Hard" are sufficient -- no additional description of what each difficulty entails is shown to the player.
