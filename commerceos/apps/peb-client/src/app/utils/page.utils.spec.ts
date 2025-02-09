import { PebPageVariant } from '@pe/builder/core';
import { find404, findPageByUrl } from './page.utils';

describe('Page utils', () => {
  it('should find home page by variant or url', () => {
    const page1 = {
      id: 'page-1',
      url: '/',
      variant: PebPageVariant.Default,
    } as any;

    const page2 = {
      id: 'page-2',
      url: '/',
      variant: PebPageVariant.Front,
    } as any;

    expect(findPageByUrl([page1, page2], '/')).toEqual(page2);
    expect(findPageByUrl([page1, page2], '')).toEqual(page2);
    expect(findPageByUrl([page1], '/')).toEqual(page1);
    expect(findPageByUrl([page1], '')).toEqual(page1);
  });

  it('should find home page by url', () => {
    const page1 = {
      id: 'home',
      url: '/',
      variant: PebPageVariant.Front,
    } as any;

    const page2 = {
      id: 'about',
      url: '/about',
      variant: PebPageVariant.Default,
    } as any;

    const page3 = {
      id: 'about',
      url: 'about',
      variant: PebPageVariant.Default,
    } as any;


    expect(findPageByUrl([page1, page2, page3], '/about')).toEqual(page2);
    expect(findPageByUrl([page1, page2, page3], 'about')).toEqual(page2);
  });

  it('should not return 404 by url', () => {
    const page1 = {
      id: 'home',
      url: '/url',
      variant: PebPageVariant.NotFound,
    } as any;

    const page2 = {
      id: 'about',
      url: '/url',
      variant: PebPageVariant.Default,
    } as any;

    expect(findPageByUrl([page1, page2], '/url')).toEqual(page2);
  });

  it('should find 404 page', () => {
    const page1 = {
      id: 'home',
      url: '/url',
      variant: PebPageVariant.NotFound,
    } as any;

    const page2 = {
      id: 'about',
      url: '/url',
      variant: PebPageVariant.Default,
    } as any;

    expect(find404([page1, page2])).toEqual(page1);

  })
})
