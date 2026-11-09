/**
 * Simple className utility – concatenates truthy values.
 * Replaces clsx for zero-dependency usage.
 */
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}
