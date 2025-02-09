import { getCountryContinentList } from './get-country-continent-list';

describe('getCountryContinentList', () => {
  it('should return not empty object', () => {
    expect(getCountryContinentList() instanceof Object).toBeTruthy();
    expect(getCountryContinentList()).not.toEqual({});
  });
});
