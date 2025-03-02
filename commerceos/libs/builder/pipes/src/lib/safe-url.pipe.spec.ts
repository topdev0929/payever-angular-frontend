import { DomSanitizer } from '@angular/platform-browser';

import { PebSafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {

  const sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
    bypassSecurityTrustUrl: 'bypassed',
  });
  const pipe = new PebSafeUrlPipe(sanitizer);

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    expect(pipe.transform('test')).toEqual('bypassed');
    expect(sanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith('test');

  });

});
