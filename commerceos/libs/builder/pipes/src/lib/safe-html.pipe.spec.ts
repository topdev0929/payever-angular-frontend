import { DomSanitizer } from '@angular/platform-browser';

import { PebSafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {

  const sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
    bypassSecurityTrustHtml: 'bypassed',
  });
  const pipe = new PebSafeHtmlPipe(sanitizer);

  it('should be defined', () => {

    expect(pipe).toBeDefined();

  });

  it('should transform', () => {

    expect(pipe.transform('test')).toEqual('bypassed');
    expect(sanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('test');

  });

});
