import { ContinentListInterface } from '../interfaces';

export function getContinentList(): ContinentListInterface[] {
  const continents: any[] = require(`countries-list/dist/continents.min.json`);
  const result: ContinentListInterface[] = [];

  for (const continent in continents) {
    if (continents.hasOwnProperty(continent)) {
      result.push({
        code: continent,
        name: continents[continent]
      });
    }
  }

  return result;
}
