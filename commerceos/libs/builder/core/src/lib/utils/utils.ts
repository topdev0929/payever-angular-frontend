export function stringToEnum<T>(value: string, enm: { [s: string]: T }): T | undefined {
  return (Object.values(enm) as unknown as string[]).includes(value)
    ? value as unknown as T
    : undefined;
}
