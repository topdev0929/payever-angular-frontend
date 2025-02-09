import { duration } from "moment";

export const transactionRetentionOptions: {
  value: number,
  unit: Parameters<typeof duration>[1]
}[] = [
  { value: 30 , unit: 'days' },
  { value: 60 , unit: 'days' },
  { value: 180 , unit: 'days' },
  { value: 1 , unit: 'years' },
  { value: 2 , unit: 'years' },
  { value: 3 , unit: 'years' },
  { value: 5 , unit: 'years' },
];