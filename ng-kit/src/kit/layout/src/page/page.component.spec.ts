import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { LayoutPageComponent } from './page.component';
import { nonRecompilableTestModuleHelper } from '../../../test';

@Component({
  template: `
    <pe-layout-page [isCentered]="isCentered">
      <div header *ngIf="showHeader">
        <header class="test-layout-page-header">[test_layout_page_header]</header>
      </div>

      <div nav *ngIf="showNav">
        <nav class="test-layout-page-nav">[test_layout_page_nav]</nav>
      </div>

      <div *ngIf="showContent">
        <p class="test-layout-page-content">[test_layout_page_content]</p>
      </div>
    </pe-layout-page>
  `
})
class LayoutPageHostTestComponent {
  isCentered: boolean = false;
  showHeader: boolean = false;
  showNav: boolean = false;
  showContent: boolean = false;
}

describe('LayoutPageComponent', () => {
  nonRecompilableTestModuleHelper({
    declarations: [
      LayoutPageComponent,
      LayoutPageHostTestComponent,
    ]
  });

  describe('via host component', () => {
    let fixture: ComponentFixture<LayoutPageHostTestComponent>;
    let component: LayoutPageHostTestComponent;

    const isCenteredSelector: string = '.layout-centered';

    const layoutPageHeaderSelector: string = '.test-layout-page-header';
    const layoutPageHeaderContent: string = '[test_layout_page_header]';

    const layoutPageNavSelector: string = '.test-layout-page-nav';
    const layoutPageNavContent: string = '[test_layout_page_nav]';

    const layoutPageContentSelector: string = '.test-layout-page-content';
    const layoutPageContentContent: string = '[test_layout_page_content]';

    beforeEach(() => {
      fixture = TestBed.createComponent(LayoutPageHostTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create host component', () => {
      expect(component).toBeDefined();
    });

    it('should process @Input() isCentered', () => {
      let isCenteredElement: DebugElement;

      isCenteredElement = fixture.debugElement.query(By.css(isCenteredSelector));
      expect(isCenteredElement).toBeNull();

      component.isCentered = true;
      fixture.detectChanges();
      isCenteredElement = fixture.debugElement.query(By.css(isCenteredSelector));
      expect(isCenteredElement).not.toBeNull();
    });

    it('should render content', () => {
      let content: DebugElement;

      content = fixture.debugElement.query(By.css(layoutPageContentSelector));
      expect(content).toBeNull();

      component.showContent = true;
      fixture.detectChanges();
      content = fixture.debugElement.query(By.css(layoutPageContentSelector));
      expect(content).not.toBeNull();
      expect((content.nativeElement as HTMLParagraphElement).textContent).toBe(layoutPageContentContent);
    });

    it('should render header', () => {
      let header: DebugElement;

      header = fixture.debugElement.query(By.css(layoutPageHeaderSelector));
      expect(header).toBeNull();

      component.showHeader = true;
      fixture.detectChanges();
      header = fixture.debugElement.query(By.css(layoutPageHeaderSelector));
      expect(header).not.toBeNull();
      expect((header.nativeElement as HTMLParagraphElement).textContent).toBe(layoutPageHeaderContent);
    });

    it('should render nav', () => {
      let nav: DebugElement;

      nav = fixture.debugElement.query(By.css(layoutPageNavSelector));
      expect(nav).toBeNull();

      component.showNav = true;
      fixture.detectChanges();
      nav = fixture.debugElement.query(By.css(layoutPageNavSelector));
      expect(nav).not.toBeNull();
      expect((nav.nativeElement as HTMLParagraphElement).textContent).toBe(layoutPageNavContent);
    });
  });
});
