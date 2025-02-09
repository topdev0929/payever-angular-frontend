import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { SafeUrlPipe } from './safe-url.pipe';

describe('SafeUrlPipe', () => {
  let pipe: SafeUrlPipe;
  let domSanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SafeUrlPipe,
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (val: string) => val,
          },
        },
      ],
    });

    pipe = TestBed.inject(SafeUrlPipe);
    domSanitizer = TestBed.inject(DomSanitizer);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call DomSanitizer.bypassSecurityTrustResourceUrl with the correct url', () => {
    const url = 'https://payever.org';
    const bypassSecurityTrustResourceUrl = jest.spyOn(domSanitizer, 'bypassSecurityTrustResourceUrl');

    pipe.transform(url);

    expect(bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(url);
  });
});
