import { TextSizeList } from './interfaces';

const currencyNominal: { [currency: string]: number } = {
  EUR: 3000,
  NOK: 3000,
  DKK: 3000,
  SEK: 3000
};

const TEXT_SIZE_LIST: TextSizeList[] = [
  {value: '16px', text: '16px'},
  {value: '18px', text: '18px'},
  {value: '20px', text: '20px'}
];

export { currencyNominal, TEXT_SIZE_LIST };
