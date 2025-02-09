export function isCacheAllowed(req: any): boolean {
  return req.headers['cache-control'] !== 'no-cache';
}