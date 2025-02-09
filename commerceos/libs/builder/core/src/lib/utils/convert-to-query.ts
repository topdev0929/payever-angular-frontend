export function convertToQuery(obj: any) {
  // Make sure we don't alter integers.
  if (typeof obj === 'number') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const props: string = obj.map(value => `${convertToQuery(value)}`).join(',');

    return `[${props}]`;
  }

  if (typeof obj === 'object' && obj !== null) {
    const props: string = Object.keys(obj)
      .map(key => `${key}:${convertToQuery(obj[key])}`)
      .join(',');

    return `{${props}}`;
  }

  return JSON.stringify(obj);
}
