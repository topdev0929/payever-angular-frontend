import { PEB_CACHE_VER } from '../../src/constants';


export function getUrl(req: any): URL {
  const host = req.headers['x-forwarded-host'] as string ?? req.hostname;
  const url = new URL(`${req.protocol}://${host}${req.path}`);

  return url;
}

export function getDomain(req: any): string { 
  const url = getUrl(req);
  const domain = url.hostname.replace('localhost', process.env.APP_HOST as string);

  return domain;
}

export function getRenderCacheKey(
  req: any,
  params: {
    domain: string;
    language: string | undefined;
    isSearchEngine: boolean;
  },
) {
  const queryString = Object.keys(req.query).map(k => `${k}=${req.query[k]}`).join('&');

  const terms = [
    params.domain,
    req.path,
    queryString,
    params.language,
    params.isSearchEngine ? 'seo' : 'user',
    PEB_CACHE_VER,
  ];

  return terms.join('-');
}
