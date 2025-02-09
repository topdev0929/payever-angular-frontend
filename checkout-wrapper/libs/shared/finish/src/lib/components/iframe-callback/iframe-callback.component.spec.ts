import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { IframeCallbackComponent } from './iframe-callback.component';

describe('iframe-callback', () => {
  let component: IframeCallbackComponent;
  let fixture: ComponentFixture<IframeCallbackComponent>;

  const sanitizer = {
    sanitize: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IframeCallbackComponent],
      providers: [{ provide: DomSanitizer, useValue: sanitizer }],
    }).compileComponents();

    fixture = TestBed.createComponent(IframeCallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('iframe', () => {
    const src = 'https://iframe-url.com';
    const iframe = {
      className: '',
      src: '',
      setAttribute: jest.fn(),
    } as unknown as HTMLIFrameElement;
    let createElement: jest.SpyInstance;
    let querySelector: jest.SpyInstance;
    let appendChild: jest.SpyInstance;

    beforeEach(() => {
      createElement = jest.spyOn(document, 'createElement').mockReturnValue(iframe);
      querySelector = jest.spyOn(document, 'querySelector');
      appendChild = jest.spyOn(document.body, 'appendChild').mockReturnValue(null);
    });

    afterEach(() => {
      createElement.mockRestore();
      querySelector.mockRestore();
      appendChild.mockRestore();
    });

    it('should create iframe with string src after 300 ms', fakeAsync(() => {
      fixture.componentRef.setInput('src', src);
      tick(300);

      expect(createElement).toHaveBeenCalled();
      expect(iframe.className).toEqual('hidden-callback-iframe');
      expect(iframe.src).toEqual(src);
      expect(iframe.setAttribute).toHaveBeenCalledWith('sandbox', 'allow-scripts');
      expect(appendChild).toHaveBeenCalled();
    }));

    it('should skip if iframe already on page', fakeAsync(() => {
      querySelector.mockReturnValue(iframe);
      fixture.componentRef.setInput('src', src);
      fixture.detectChanges();
      tick(300);

      expect(createElement).not.toHaveBeenCalled();
    }));

    it('should sanitize src', () => {
      fixture.componentRef.setInput('src', new URL(src));
      expect(sanitizer.sanitize).toHaveBeenCalled();
    });
  });
});
