import { PEB_LANGUAGE_QUERY_PARAM } from '@pe/builder/render-utils';

export function detectLanguage(req: any): string | undefined {
  return req.headers['x-payever-language'] || req.query[PEB_LANGUAGE_QUERY_PARAM];
}