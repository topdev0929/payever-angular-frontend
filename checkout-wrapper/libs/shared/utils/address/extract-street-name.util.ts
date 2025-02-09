export function extractStreetNameAndNumber(street: string): string[] {
  const arr = (street || '').split(' ');
  const last = arr.pop();

  // If last part has digits - last part is street number
  if (arr.length > 0 && /\d/.test(last)) {
    return [arr.join(' '), last];
  }

  return [street, ''];
}
