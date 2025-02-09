export function parseTestAttribute(val: string): string {
  return String(val).split(' ').join('+').toLowerCase();
}
