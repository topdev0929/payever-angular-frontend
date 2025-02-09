export function parseReferenceNumber(creditAnswer: string): string {
  const matchedValue: RegExpMatchArray = /Referenznummer:\s+\d*/.exec(creditAnswer);

  return matchedValue ? matchedValue[0].replace(/^\D+/g, '') : '';
}
