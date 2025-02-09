import { getContinentList } from './get-continent-list';

describe('getContinentList', () => {
  it('should return proper value', () => {
    expect(getContinentList() instanceof Array).toBeTruthy();
    expect(getContinentList()[0].hasOwnProperty('code')).toBeTruthy();
    expect(getContinentList()[0].hasOwnProperty('name')).toBeTruthy();
  });
});
