export const round = (number: number, precision = 15) => {
  return Math.round(number * precision) / precision;
};
