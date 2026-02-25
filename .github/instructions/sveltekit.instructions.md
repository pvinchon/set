# Copilot Instructions – SvelteKit + TypeScript

## Core Principles

- All code must use TypeScript.
- Strict mode must be respected.
- Do not use `any`.
- Prefer explicit types over inferred complex types.
- No business logic inside UI components.
- Follow server first design principles.

---

## Project Structure

Follow standard SvelteKit structure:

src/
routes/
lib/
components/
server/
domain/
utils/

Rules:

- UI components live in `lib/components`.
- Business logic lives in `lib/domain`.
- Server only logic lives in `lib/server`.
- Shared utilities live in `lib/utils`.
- Never place domain logic inside `+page.svelte`.
- Keep routes thin and orchestration focused.

---

## Routing Conventions

- Use `+page.ts` or `+page.server.ts` for load functions.
- Use `+server.ts` for API endpoints.
- Keep endpoints minimal and delegate to domain layer.
- Do not embed database queries directly inside route files.
- Validate all input in endpoints.

---

## Server vs Client

- Default to server side rendering.
- Avoid unnecessary client side fetching.
- Use `load` functions properly.
- Never expose secrets to client side code.
- Environment variables must use `$env/static/private` or `$env/static/public` correctly.

---

## State Management

- Prefer server driven state.
- Use Svelte stores only when necessary.
- Do not create global mutable state unless required.
- Avoid hidden side effects in reactive blocks.

---

## Forms

- Prefer SvelteKit form actions.
- Use progressive enhancement.
- Validate inputs on server.
- Do not rely only on client side validation.

---

## API Design

- Use REST conventions.
- Return proper HTTP status codes.
- Do not leak internal errors.
- Keep response shapes consistent.
- Define and reuse response types.

---

## Database Access

- Database access must be isolated in `lib/server`.
- Never access database directly from UI components.
- Use repository or service pattern.
- Keep data access deterministic and testable.

---

## Testing Readiness

- Code must be testable.
- Avoid tight coupling to SvelteKit internals.
- Domain logic must be framework independent.
- Avoid side effects in module scope.

---

## Security

- Sanitize all user input.
- Never trust client side data.
- Do not expose stack traces.
- Do not log sensitive data.

---

## Performance

- Avoid unnecessary reactive computations.
- Avoid large client side bundles.
- Use dynamic imports when appropriate.
- Prefer server rendering over client hydration when possible.

---

## Error Handling

- Use `error()` helper for expected failures.
- Use `redirect()` properly.
- Do not swallow errors.
- Provide user friendly error messages.

---

## Docker Compatibility

- Do not hardcode ports.
- Read configuration from environment variables.
- Ensure app can run in Node adapter.
- No filesystem assumptions unless explicitly defined.

---

## Code Generation Rules

When generating code:

- Respect project structure.
- Keep route files thin.
- Extract reusable logic.
- Use strong typing.
- Avoid duplication.
- Avoid inline complex logic inside Svelte markup.
- Prefer readable over clever code.
