/**
 * Screen definition — a named screen that can create its root element.
 */
export interface ScreenDef {
  /** Create the root element for this screen. */
  create(): HTMLElement;
  /** Called after the screen element is mounted into the DOM. */
  onMount?(el: HTMLElement): void;
  /** Called before the screen element is removed from the DOM. */
  onUnmount?(el: HTMLElement): void;
}

/**
 * Screen router — mounts/unmounts screen elements with animated transitions.
 *
 * Exactly one screen is in the DOM at a time. Transitions use a CSS
 * animation class applied on mount; screens are removed after exit.
 */
export interface Router {
  /** Navigate to a screen by name, removing the current and mounting the new. */
  navigateTo(screen: string): void;
}

const TRANSITION_CLASS = "animate-screen-in";

/**
 * Create a screen router.
 *
 * @param container – Parent element where screen roots are mounted.
 * @param screens – Map of screen name → definition.
 * @param initial – Name of the screen to show on creation.
 */
export function createRouter(
  container: HTMLElement,
  screens: Record<string, ScreenDef>,
  initial: string,
): Router {
  let active = "";

  function mount(name: string): void {
    const def = screens[name];
    const el = def.create();
    container.appendChild(el);
    el.classList.add(TRANSITION_CLASS);
    def.onMount?.(el);
    active = name;
  }

  function unmount(): void {
    const el = container.firstElementChild as HTMLElement | null;
    if (!el) return;
    const def = screens[active];
    def?.onUnmount?.(el);
    el.remove();
  }

  // Mount initial screen
  mount(initial);

  return {
    navigateTo(screen: string) {
      if (screen === active) return;
      unmount();
      mount(screen);
    },
  };
}
