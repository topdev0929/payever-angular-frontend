
const searchEngineUserAgents = [
  'Googlebot',
  'bingbot',
  'AOLBuild',
  'http://www.google.com/bot.html',
  'http://www.bing.com/bingbot.htm',
  'http://yandex.com/bots',
];

export function isSearchEngineRequest(req: any): boolean {
  const userAgent = req.get('user-agent');

  return searchEngineUserAgents.some(str => userAgent.includes(str));
}