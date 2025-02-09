export function writeGzipHeader(res: any) {
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Content-Encoding', 'gzip');
}

export function writeCacheHeader(res: any, age: number = 31557600) {
  res.setHeader('Cache-Control', `public, max-age=${age}, s-maxage=${age}`);
}

export function writeContentTypeJson(res: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export function writeContentTypeCss(res: any) {
  res.setHeader('Content-Type', 'text/css; charset=UTF-8');
}


export function writeContentTypeHtml(res: any) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
}