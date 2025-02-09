import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule, APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';

import { LayoutBackComponent, RouterLinkType } from './back.component';
import { nonRecompilableTestModuleHelper } from '../../../test';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('BackComponent', () => {
  let fixture: ComponentFixture<LayoutBackComponent>;
  let component: LayoutBackComponent;

  const backHrefSelector: string = '.back-href';
  const backLinkfSelector: string = '.back-link';
  const backButtonfSelector: string = '.back-button';
  const backTestText: string = '[back_test_text]';
  const baseHref: string = 'http://example.com/';
  const testHrefValue: string = '/[simple_test_href]';
  const testLinkValue: RouterLinkType = ['simple_test_link', 'path'];

  nonRecompilableTestModuleHelper({
    imports: [
      CommonModule,
      RouterModule.forRoot([{ path: '', component: LayoutBackComponent }]),
    ],
    providers: [
      { provide: APP_BASE_HREF, useValue: baseHref }
    ],
    declarations: [LayoutBackComponent]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component', () => {
    it('should create instance', () => {
      expect(component).toBeDefined();
      expect(component instanceof LayoutBackComponent).toBe(true);
    });

    it('should render button with text by default', () => {
      let backButton: DebugElement;

      backButton = fixture.debugElement.query(By.css(backButtonfSelector));
      expect(backButton).not.toBeNull('back button should be rendered by default');
      expect(backButton.nativeElement instanceof HTMLButtonElement).toBe(true);
      expect(backButton).not.toBeNull();
      expect(fixture.debugElement.query(By.css(backHrefSelector))).toBeNull();
      expect(fixture.debugElement.query(By.css(backLinkfSelector))).toBeNull();

      expect(backButton.nativeElement.textContent).not.toContain(backTestText);
      component.text = backTestText;
      fixture.detectChanges();
      expect(backButton.nativeElement.textContent).toContain(backTestText);
    });

    it('should accept href and render anchor with text when specified', () => {
      let backHref: DebugElement;

      backHref = fixture.debugElement.query(By.css(backHrefSelector));
      expect(backHref).toBeNull();

      component.href = testHrefValue;
      fixture.detectChanges();
      backHref = fixture.debugElement.query(By.css(backHrefSelector));
      expect(backHref.nativeElement instanceof HTMLAnchorElement).toBe(true);
      expect(backHref).not.toBeNull();
      expect(backHref.attributes['href']).toBe(testHrefValue);
      expect(fixture.debugElement.query(By.css(backButtonfSelector))).toBeNull();
      expect(fixture.debugElement.query(By.css(backLinkfSelector))).toBeNull();

      expect(backHref.nativeElement.textContent).not.toContain(backTestText);
      component.text = backTestText;
      fixture.detectChanges();
      expect(backHref.nativeElement.textContent).toContain(backTestText);
    });

    it('should accept link and render anchor with text when specified', () => {
      let backLink: DebugElement;

      backLink = fixture.debugElement.query(By.css(backLinkfSelector));
      expect(backLink).toBeNull();

      component.link = testLinkValue;
      fixture.detectChanges();
      backLink = fixture.debugElement.query(By.css(backLinkfSelector));
      expect(backLink.nativeElement instanceof HTMLAnchorElement).toBe(true);
      expect(backLink).not.toBeNull();
      expect((backLink.nativeElement as HTMLAnchorElement).href).toBe(`${baseHref}${testLinkValue.join('/')}`);
      expect(fixture.debugElement.query(By.css(backButtonfSelector))).toBeNull();
      expect(fixture.debugElement.query(By.css(backHrefSelector))).toBeNull();

      expect(backLink.nativeElement.textContent).not.toContain(backTestText);
      component.text = backTestText;
      fixture.detectChanges();
      expect(backLink.nativeElement.textContent).toContain(backTestText);
    });

    it('should check isLink()', () => {
      expect(component.isLink).toBeFalsy();
      component.href = testHrefValue;
      expect(component.isLink).toBeFalsy();
      component.link = testLinkValue;
      expect(component.isLink).toBeTruthy();
    });

    it('should check isHref()', () => {
      expect(component.isHref).toBeFalsy();
      component.href = testHrefValue;
      expect(component.isHref).toBeTruthy();
      component.link = testLinkValue;
      expect(component.isHref).toBeFalsy();
    });

    it('shoudl emit @Output() click on button click', () => {
      let backButton: DebugElement;
      let wasEmitted: boolean = false;

      backButton = fixture.debugElement.query(By.css(backButtonfSelector));
      component.click.subscribe(
        (evt: MouseEvent) => {
          expect(evt instanceof MouseEvent).toBe(true);
          wasEmitted = true;
        },
        fail
      );
      (backButton.nativeElement as HTMLButtonElement).click();
      expect(wasEmitted).toBe(true);
    });
  });
});
