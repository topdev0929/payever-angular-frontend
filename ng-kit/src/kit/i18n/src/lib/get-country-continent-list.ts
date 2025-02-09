import { CountryContinentListInterface } from '../interfaces';

export function getCountryContinentList(): CountryContinentListInterface {
  return require(`./country-continent-list.json`);
}
