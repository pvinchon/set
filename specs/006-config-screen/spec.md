# Feature Specification: Configuration Screen

**Feature Branch**: `006-config-screen`  
**Created**: 2026-02-24  
**Status**: Draft  
**Input**: User description: "Add a configuration screen for users to select colors, shapes, and patterns. This screen should be accessible from the title screen. The user's preferences should be saved in local storage or cookie."

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Customize Card Colors (Priority: P1)

A player opens the configuration screen from the title screen and selects their preferred set of three colors used to render cards. The game currently uses three fixed colors (pink, blue, amber) to distinguish card attributes. The player picks three colors from a curated palette, previews how cards will look, and saves their choice. The next time they start a game, cards display using the chosen colors.

**Why this priority**: Colors are the most visually dominant attribute on every card. Letting players personalize colors delivers the highest visual impact and also supports accessibility (e.g., players with color-vision deficiency can choose high-contrast combinations).

**Independent Test**: Can be fully tested by opening the configuration screen, changing the three colors, starting a new game, and verifying cards render in the selected colors.

**Acceptance Scenarios**:

1. **Given** the player is on the title screen, **When** they tap the configuration button, **Then** the configuration screen is displayed.
2. **Given** the player is on the configuration screen, **When** they select three colors from the palette, **Then** a live preview updates to show a sample card in each chosen color.
3. **Given** the player has selected three colors and saves, **When** they return to the title screen and start a game, **Then** all cards use the newly chosen colors.
4. **Given** the player has not customized colors, **When** they start a game, **Then** the default colors (pink, blue, amber) are used.

---

### User Story 2 - Customize Card Shapes (Priority: P2)

A player opens the configuration screen and selects their preferred set of three shapes used on cards. The game currently uses circle, square, and triangle. The player picks three shapes from an expanded palette (e.g., circle, square, triangle, diamond, star, hexagon), previews the result, and saves.

**Why this priority**: Shapes are the second-most distinguishable attribute. Allowing shape customization adds variety and can improve accessibility for colorblind players who rely more on shape differences.

**Independent Test**: Can be fully tested by opening the configuration screen, selecting three shapes, starting a game, and verifying cards render with the chosen shapes.

**Acceptance Scenarios**:

1. **Given** the player is on the configuration screen, **When** they view the shapes section, **Then** they see the available shape options with the current selection highlighted.
2. **Given** the player selects three shapes and saves, **When** they start a new game, **Then** cards display using the chosen shapes.
3. **Given** the player selects fewer than three shapes, **When** they attempt to save, **Then** the system prevents saving and indicates that exactly three shapes must be selected.

---

### User Story 3 - Customize Card Patterns (Priority: P3)

A player opens the configuration screen and selects their preferred set of three shading patterns used on cards. The game currently uses solid, striped, and open. The player picks three patterns from an expanded palette (e.g., solid, striped, open, dotted, crosshatch, gradient), previews the result, and saves.

**Why this priority**: Patterns (shading) are the third visual dimension. Customization here provides full visual personalization when combined with colors and shapes.

**Independent Test**: Can be fully tested by opening the configuration screen, selecting three patterns, starting a game, and verifying cards render with the chosen patterns.

**Acceptance Scenarios**:

1. **Given** the player is on the configuration screen, **When** they view the patterns section, **Then** they see available pattern options with the current selection highlighted.
2. **Given** the player selects three patterns and saves, **When** they start a new game, **Then** cards use the chosen patterns.
3. **Given** the player selects fewer than three patterns, **When** they attempt to save, **Then** the system prevents saving and indicates that exactly three patterns must be selected.

---

### User Story 4 - Preferences Persist Across Sessions (Priority: P1)

A player customizes their colors, shapes, and patterns, closes the browser, and returns later. Their preferences are automatically loaded so they do not have to reconfigure each time.

**Why this priority**: Persistence is essential for the customization feature to be useful. Without it, players would need to reconfigure every visit, making the feature impractical.

**Independent Test**: Can be fully tested by saving preferences, closing and reopening the browser, then verifying the configuration screen and game reflect the saved preferences.

**Acceptance Scenarios**:

1. **Given** the player has saved custom preferences, **When** they revisit the application in a new browser session, **Then** their previously saved preferences are loaded automatically.
2. **Given** the player has saved preferences, **When** they open the configuration screen, **Then** the screen shows the previously saved selections.
3. **Given** saved preference data is missing or corrupted, **When** the application loads, **Then** the system falls back to default values gracefully without errors.

---

### User Story 5 - Reset to Defaults (Priority: P2)

A player wants to undo all customizations and return to the original card appearance. They open the configuration screen and tap a "Reset to Defaults" button.

**Why this priority**: Provides a safety net so players can easily revert changes without manually remembering the original settings.

**Independent Test**: Can be fully tested by customizing preferences, pressing Reset to Defaults, and verifying all selections revert to the defaults.

**Acceptance Scenarios**:

1. **Given** the player has custom preferences saved, **When** they tap "Reset to Defaults" on the configuration screen, **Then** all selections revert to the original defaults (pink/blue/amber colors, circle/square/triangle shapes, solid/striped/open patterns).
2. **Given** the player resets to defaults and saves, **When** they start a new game, **Then** cards render with the default appearance.

---

### Edge Cases

- What happens when the player selects the same color for two or more slots? The system must enforce that all three color choices are distinct.
- What happens when the player selects the same shape or pattern for two or more slots? The system must enforce that all three selections within each attribute category are distinct.
- What happens when stored preferences reference an option that no longer exists in a future update? The system falls back to defaults for any invalid stored value.
- What happens when local storage is full or unavailable? The system allows the player to play with defaults and displays a non-blocking notification that preferences could not be saved.
- What happens when the player navigates away from the configuration screen without saving? Any unsaved changes are discarded, and the player is returned to the title screen with the previous preferences intact.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The title screen MUST display a clearly labeled button to access the configuration screen.
- **FR-002**: The configuration screen MUST allow the player to select exactly three distinct colors from a curated palette of at least six color options.
- **FR-003**: The configuration screen MUST allow the player to select exactly three distinct shapes from a palette of at least six shape options.
- **FR-004**: The configuration screen MUST allow the player to select exactly three distinct patterns (shadings) from a palette of at least six pattern options.
- **FR-005**: The configuration screen MUST show a live preview of sample cards reflecting the current selections.
- **FR-006**: The system MUST validate that exactly three distinct items are selected per attribute category before allowing the player to save.
- **FR-007**: The system MUST persist the player's preferences in local storage so they survive browser sessions.
- **FR-008**: The system MUST load saved preferences on application startup and apply them to all subsequent games.
- **FR-009**: The configuration screen MUST provide a "Reset to Defaults" action that reverts all selections to the original defaults.
- **FR-010**: The configuration screen MUST provide a "Save" action that stores the current selections and returns the player to the title screen.
- **FR-011**: The configuration screen MUST provide a "Back" or "Cancel" action that discards unsaved changes and returns to the title screen.
- **FR-012**: The system MUST fall back to default values gracefully when stored preferences are missing, corrupted, or reference invalid options.
- **FR-013**: The game MUST use the player's saved color, shape, and pattern preferences when rendering cards during gameplay.

### Key Entities

- **Player Preferences**: The player's chosen set of three colors, three shapes, and three patterns. Stored per-browser (no user account required). Has a creation/modification timestamp.
- **Color Option**: A named color with a visual swatch. At least six options available for selection. Each has a unique identifier and a display value (hex or named color).
- **Shape Option**: A named shape with an icon or outline preview. At least six options available. Each has a unique identifier and a rendering definition.
- **Pattern Option**: A named shading/pattern style with a visual preview. At least six options available. Each has a unique identifier and a rendering style.

## Assumptions

- The application is single-player and runs entirely in the browser; no server-side storage is needed.
- Local storage is the preferred persistence mechanism (widely supported, sufficient capacity for small preference data).
- The curated palettes (colors, shapes, patterns) are defined at build time; players choose from a fixed set rather than creating arbitrary custom values.
- The configuration applies globally to all games regardless of difficulty level.
- Exactly three options must be selected per category because the SET game mechanic requires exactly three distinct values per attribute dimension.
- The default options match the current game appearance: pink (#dc267f), blue (#648fff), amber (#ffb000) for colors; circle, square, triangle for shapes; solid, striped, open for patterns.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Players can open the configuration screen, customize all three attribute categories, save, and start a game with their chosen appearance in under 60 seconds.
- **SC-002**: Saved preferences persist correctly across browser sessions — 100% of valid saved preferences are restored on next visit.
- **SC-003**: 95% of players can complete the customization flow without errors or confusion on first attempt (no help text needed beyond labels).
- **SC-004**: The configuration screen loads and becomes interactive within 1 second of navigation.
- **SC-005**: The live preview updates within 200 milliseconds of any selection change, providing immediate visual feedback.
- **SC-006**: When no preferences are saved, 100% of games launch with the correct default card appearance.
