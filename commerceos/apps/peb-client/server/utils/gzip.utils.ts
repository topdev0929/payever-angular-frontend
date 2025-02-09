import * as zlib from 'zlib';
import { Gzip } from 'zlib';


export function responseGzipStream(res: any, data: any, endCallback?: (buffer: Buffer) => void) {
  const gzipStream: Gzip = zlib.createGzip();
  const chunks: Buffer[] = [];
  gzipStream.on('data', (chunk) => {
    chunks.push(chunk);
  });

  gzipStream.on('end', async () => {    
    endCallback && endCallback(Buffer.concat(chunks));
  });

  gzipStream.pipe(res);
  gzipStream.write(data);
  gzipStream.end();
}
