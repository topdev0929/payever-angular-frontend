import { isSearchEngineRequest } from "./search-engine.utils";

describe('Search engine utils', () => {
  it('should detect google bot by user agent', () => {
    const req: any = {
      headers: {
        'user-agent': 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)',
      }
    };

    req.get = (str: string | number) => req.headers[str];

    expect(isSearchEngineRequest(req)).toBeTruthy();

    req.headers['user-agent'] = 'Mozzila';
    expect(isSearchEngineRequest(req)).toBeFalsy();
  })
})