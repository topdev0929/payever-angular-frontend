import { Component, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { PreventDoubleTapZoomDirective } from './prevent-double-tap-zoom.directive';

@Component({
  template: `
    <div pePreventDoubleTapZoom [pePreventDoubleTapZoomSelector]='selector'></div>
  `,
})
class TestComponent {
  selector: string;
}

describe('PreventDoubleTapZoomDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directiveElement: DebugElement;
  let directive: PreventDoubleTapZoomDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PreventDoubleTapZoomDirective, TestComponent],
    });

    jest.spyOn(console, 'warn').mockReturnValue(null);

    fixture = TestBed.createComponent(TestComponent);
    directiveElement = fixture.debugElement.query(By.directive(PreventDoubleTapZoomDirective));
    directive = directiveElement.injector.get(PreventDoubleTapZoomDirective);

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('should create the directive', () => {
      expect(directiveElement).toBeDefined();
      expect(directive).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should call handleMobileDoubleTap on ngOnInit', () => {
      const handleMobileDoubleTap = jest.spyOn(directive as any, 'handleMobileDoubleTap');
      directive.ngOnInit();
      expect(handleMobileDoubleTap).toHaveBeenCalled();
    });
  });

  describe('ngOnDestroy', () => {
    it('should trigger destroyed$', () => {
      const destroyedNext = jest.spyOn(directive['destroyed$'], 'next');
      const destroyedComplete = jest.spyOn(directive['destroyed$'], 'complete');
      directive.ngOnDestroy();
      expect(destroyedNext).toHaveBeenCalledWith(true);
      expect(destroyedComplete).toHaveBeenCalled();
    });
  });

  describe('handleMobileDoubleTap', () => {
    it('should handle if pePreventDoubleTapZoomSelector null', () => {
      const querySelector = jest.spyOn(document, 'querySelector');
      directive.pePreventDoubleTapZoomSelector = null;
      directive['handleMobileDoubleTap']();
      expect(querySelector).not.toHaveBeenCalled();
    });
    it('should handle if pePreventDoubleTapZoomSelector is defined', () => {
      const querySelector = jest.spyOn(document, 'querySelector');
      directive.pePreventDoubleTapZoomSelector = 'test';
      directive['handleMobileDoubleTap']();
      expect(querySelector).toHaveBeenCalled();
    });
  });

  describe('preventEventOnClick', () => {
    let preventDefault: jest.SpyInstance;
    let stopImmediatePropagation: jest.SpyInstance;
    let stopPropagation: jest.SpyInstance;
    const timeStamp = 1000;

    beforeEach(() => {
      preventDefault = jest.fn();
      stopImmediatePropagation = jest.fn();
      stopPropagation = jest.fn();
    });

    it('should handle return if delta is 0 or undefined', () => {
      const currentTarget = fixture.debugElement.query(By.css('div')).nativeElement;
      const touches = ['touches'];
      const evn: any = {
        currentTarget,
        timeStamp,
        touches,
        preventDefault,
      };

      directive['preventEventOnClick'](evn);
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should handle return if delta is higher then eventsDelta', () => {
      const currentTarget = fixture.debugElement.query(By.css('div')).nativeElement;
      const touches = ['touches'];
      currentTarget.dataset['lastTouch'] = 300;
      const evn: any = {
        currentTarget,
        timeStamp,
        touches,
        preventDefault,
      };

      directive['preventEventOnClick'](evn);
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should handle return if delta if fingers more then 1', () => {
      const currentTarget = fixture.debugElement.query(By.css('div')).nativeElement;
      const touches = ['touches', 'touches'];
      currentTarget.dataset['lastTouch'] = 900;
      const evn: any = {
        currentTarget,
        timeStamp,
        touches,
        preventDefault,
      };

      directive['preventEventOnClick'](evn);
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it('should handle stopImmediatePropagation', () => {
      const currentTarget = fixture.debugElement.query(By.css('div')).nativeElement;
      const touches = ['touches'];
      currentTarget.dataset['lastTouch'] = 900;
      const evn: any = {
        currentTarget,
        timeStamp,
        touches,
        preventDefault,
        stopImmediatePropagation,
      };

      directive['preventEventOnClick'](evn);
      expect(stopImmediatePropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });

    it('should handle stopImmediatePropagation', () => {
      const currentTarget = fixture.debugElement.query(By.css('div')).nativeElement;
      const touches = ['touches'];
      currentTarget.dataset['lastTouch'] = 900;
      const evn: any = {
        currentTarget,
        timeStamp,
        touches,
        preventDefault,
        stopPropagation,
      };

      directive['preventEventOnClick'](evn);
      expect(stopPropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
    });
  });

});
