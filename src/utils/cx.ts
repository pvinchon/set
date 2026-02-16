// Conditional class name helper — filters falsy values and joins with spaces.
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
