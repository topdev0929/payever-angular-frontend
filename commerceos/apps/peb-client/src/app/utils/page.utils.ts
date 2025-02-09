import { PebPageVariant, PebViewPage, isMasterPage } from '@pe/builder/core';


export function findPageByUrl(pages: PebViewPage[], url: string): PebViewPage | undefined {
  if (!pages) {
    return undefined;
  }

  const availablePages = Object.values(pages)
    .filter(p => !isMasterPage(p)
      && p.variant !== PebPageVariant.NotFound
      && p.variant !== PebPageVariant.Partial
    );
  url = startUrlWithSlash(url);

  if (url === '/') {
    return availablePages.find(page => page.variant === 'front')
      ?? availablePages.find(page => !page.url || page.url === '/');
  }

  return availablePages.find(page => startUrlWithSlash(page.url) === url);
}

export function find404(pages: PebViewPage[]): PebViewPage | undefined {
  return findPageByVariant(pages, PebPageVariant.NotFound);
}

export function findPageByVariant(pages: PebViewPage[], variant: PebPageVariant): PebViewPage | undefined {
  return pages?.find(page => !isMasterPage(page) && page.variant === variant);
}

function startUrlWithSlash(url: string): string {
  return `${!url?.startsWith('/') ? '/' : ''}${url}`;
}
