# Copilot Instructions – Tailwind CSS

## Core Principles

- Use Tailwind utility classes only.
- Do not write custom CSS unless explicitly required.
- Avoid `<style>` blocks inside components.
- Do not create global CSS overrides unless necessary.
- Prefer composition of utilities over custom classes.

---

## Design Consistency

- Follow a consistent spacing scale.
- Use Tailwind spacing utilities only.
- Do not invent arbitrary spacing values unless justified.
- Prefer design tokens from `tailwind.config.ts`.

---

## Layout Rules

- Prefer Flexbox and Grid utilities.
- Do not mix layout paradigms unnecessarily.
- Avoid deeply nested layout wrappers.
- Keep markup shallow and readable.

---

## Responsive Design

- Use mobile first breakpoints.
- Always consider responsive behavior.
- Use Tailwind breakpoint prefixes consistently.
- Do not duplicate markup for responsiveness.

---

## Component Styling

- Keep class lists readable and ordered logically:
  1. Layout
  2. Spacing
  3. Typography
  4. Colors
  5. Effects
  6. State modifiers

- Extract repeated class combinations into reusable components.
- Avoid excessive inline class duplication.

---

## Dark Mode

- Use Tailwind dark variant if enabled.
- Do not hardcode color overrides outside the theme.
- Ensure contrast accessibility.

---

## State Handling

- Use built in state modifiers:
  - hover:
  - focus:
  - active:
  - disabled:
  - group-hover:
  - peer:

- Avoid JavaScript for simple visual states.
- Prefer CSS driven state when possible.

---

## Accessibility

- Ensure sufficient color contrast.
- Always style focus states.
- Do not remove focus outlines unless replaced with accessible alternatives.
- Use semantic HTML first then style with Tailwind.

---

## Performance

- Avoid extremely long class strings when a component abstraction is better.
- Do not generate unused styles.
- Prefer configuration extension over arbitrary values.

---

## Animations

- Use Tailwind transition utilities.
- Keep animations subtle and purposeful.
- Avoid excessive motion.
- Prefer CSS based transitions over JS animations.

---

## Forms

- Use consistent input styling.
- Ensure focus and error states are visible.
- Do not rely only on color to indicate validation errors.

---

## Code Generation Rules

When generating UI:

- Do not write custom CSS files.
- Prefer Tailwind utilities.
- Keep markup clean.
- Ensure responsive behavior.
- Ensure accessibility.
- Avoid duplication of class patterns.
- Extract reusable components when patterns repeat.
