import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { LayoutAppComponent } from './layout-app.component';
import { nonRecompilableTestModuleHelper, imageUrlBase64Fixture } from '../../../test';

@Component({
  template: `
    <pe-layout-app
      [showToolbar]="enableToolbar"
      [showHeader]="enableHeader">
      <div toolbar>
        <p class="test-toolbar">[test_toolbar]</p>
      </div>

      <div header>
        <p class="test-header">[test_header]</p>
      </div>

      <div>
        <p class="test-content">[test_content]</p>
      </div>
    </pe-layout-app>
  `
})
class LayoutAppComponentTestHost {
  enableHeader: boolean = false;
  enableToolbar: boolean = false;
}

describe('LayoutAppComponent', () => {
  const layoutAppSelector: string = '.ui-layout-app';
  const layoutAppBodySelector: string = '.layout-app-body';
  const layoutAppHeaderSelector: string = '.layout-app-header';
  const layoutAppToolbarSelector: string = '.ui-layout-toolbar';
  const backgroundImgInnerSelector: string = '.layout-app-bg-inner';
  const layoutAppCloseButtonSelector: string = '.layout-app-close-button';
  const backgroundImgTestSrc: string = imageUrlBase64Fixture();

  nonRecompilableTestModuleHelper({
    declarations: [
      LayoutAppComponent,
      LayoutAppComponentTestHost
    ],
  });

  // Testing component as host
  describe('itself', () => {
    let component: LayoutAppComponent;
    let fixture: ComponentFixture<LayoutAppComponent>;

    beforeEach(async () => {
      fixture = TestBed.createComponent(LayoutAppComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should create component instance with template inside', () => {
      expect(component).toBeDefined();
      const laoyouApp: DebugElement = fixture.debugElement.query(By.css(layoutAppSelector));
      expect(laoyouApp).not.toBeNull();
    });

    it('should process @Input() showHeader', () => {
      let header: DebugElement;

      header = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(header).toBeNull('Layout Header should NOT be rendered initially');

      component.showHeader = true;
      fixture.detectChanges();
      header = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(header).not.toBeNull('Layout Header should be rendered after .showHeader=true');

      component.showHeader = false;
      fixture.detectChanges();
      header = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(header).toBeNull('Layout Header should NOT be rendered after .showHeader=false');
    });

    it('should process @Input() showToolbar', () => {
      let toolbar: DebugElement;

      toolbar = fixture.debugElement.query(By.css(layoutAppToolbarSelector));
      expect(toolbar).toBeNull('Layout toolbar should NOT be rendered initially');

      component.showToolbar = true;
      fixture.detectChanges();
      toolbar = fixture.debugElement.query(By.css(layoutAppToolbarSelector));
      expect(toolbar).not.toBeNull('Layout toolbar should be rendered after .showToolbar=true');

      component.showToolbar = false;
      fixture.detectChanges();
      toolbar = fixture.debugElement.query(By.css(layoutAppToolbarSelector));
      expect(toolbar).toBeNull('Layout toolbar should NOT be rendered after .showToolbar=false');
    });

    it('should process @Input() backgroundImageUrl', () => {
      let backgroundImgInner: DebugElement;

      backgroundImgInner = fixture.debugElement.query(By.css(backgroundImgInnerSelector));
      expect(backgroundImgInner).toBeNull('Layout background inner should NOT be rendered initially');

      component.backgroundImageUrl = backgroundImgTestSrc;
      fixture.detectChanges();
      backgroundImgInner = fixture.debugElement.query(By.css(backgroundImgInnerSelector));
      expect(backgroundImgInner).not.toBeNull('Layout background inner should be rendered after .backgroundImageUrl set');
      expect(backgroundImgInner.styles['background-image']).toBeTruthy();
      expect(backgroundImgInner.styles['background-image']).toContain(backgroundImgTestSrc);
    });

    it('should process @Input() modifier', () => {
      const classModifier: string = 'layout-app-class-modifier';
      component.modifier = classModifier;
      fixture.detectChanges();
      const laoyoutApp: DebugElement = fixture.debugElement.query(By.css(layoutAppSelector));
      expect((laoyoutApp.nativeElement as HTMLElement).className).toContain(classModifier);
    });

    it('should apply modifier if provided', () => {
      const classModifier: string = 'layout-app-class-modifier';
      const prefix: string = 'class-prefix';

      component.modifier = classModifier;
      const modified: string = component.getClassNameWithModifier(prefix);
      expect(modified).toBe(`${prefix}-${classModifier}`);

      component.modifier = null;
      const empty: string = component.getClassNameWithModifier(prefix);
      expect(empty).toBe('');
    });

    it('should process @Input() noPadding', () => {
      let appBody: DebugElement;
      const noPaddingClass: string = 'no-padding';

      appBody = fixture.debugElement.query(By.css(layoutAppBodySelector));
      expect(appBody.classes[noPaddingClass]).toBeFalsy();

      component.noPadding = true;
      fixture.detectChanges();

      appBody = fixture.debugElement.query(By.css(layoutAppBodySelector));
      expect(appBody.classes[noPaddingClass]).toBe(true);
    });

    it('should process @Input() fullView', () => {
      let laoyoutApp: DebugElement;
      const fullViewClass: string = 'fill-viewport';

      laoyoutApp = fixture.debugElement.query(By.css(layoutAppSelector));
      expect(laoyoutApp.classes[fullViewClass]).toBe(false);

      component.fullView = true;
      fixture.detectChanges();
      laoyoutApp = fixture.debugElement.query(By.css(layoutAppSelector));
      expect(laoyoutApp.classes[fullViewClass]).toBe(true);

      // Close fullscreen app layout to show test results)
      component.fullView = false;
      fixture.detectChanges();
    });

    it('should process @Input() noHeaderBorder', () => {
      let layoutAppHeader: DebugElement;
      const noBorderClass: string = 'no-border';

      // Initially show header to perform tests
      component.showHeader = true;
      fixture.detectChanges();

      layoutAppHeader = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(layoutAppHeader.classes[noBorderClass]).toBeFalsy();

      component.noHeaderBorder = true;
      fixture.detectChanges();

      layoutAppHeader = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(layoutAppHeader.classes[noBorderClass]).toBe(true);
    });

    it('should process @Input() headerTransparent', () => {
      let layoutAppHeader: DebugElement;
      const transparentHeaderClassName: string = 'transparent';

      // Initially show header to perform tests
      component.showHeader = true;
      fixture.detectChanges();

      layoutAppHeader = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(layoutAppHeader.classes[transparentHeaderClassName]).toBe(false);

      component.headerTransparent = true;
      fixture.detectChanges();
      layoutAppHeader = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(layoutAppHeader.classes[transparentHeaderClassName]).toBe(true);
    });

    it('should process @Input() headerLightGrey', () => {
      let layoutAppHeader: DebugElement;
      const headerLightGreyClassName: string = 'light-grey';

      // Initially show header to perform tests
      component.showHeader = true;
      fixture.detectChanges();

      layoutAppHeader = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(layoutAppHeader.classes[headerLightGreyClassName]).toBe(false);

      component.headerLightGrey = true;
      fixture.detectChanges();
      layoutAppHeader = fixture.debugElement.query(By.css(layoutAppHeaderSelector));
      expect(layoutAppHeader.classes[headerLightGreyClassName]).toBe(true);
    });

    it('should process @Input() withClose and pass @Output() onClose', async () => {
      let layoutAppToolbar: DebugElement;
      let laoyoutAppCloseButton: DebugElement;

      fixture.detectChanges();
      layoutAppToolbar = fixture.debugElement.query(By.css(layoutAppToolbarSelector));
      expect(layoutAppToolbar).toBeNull('layout toolbar should NOT be rendered');
      laoyoutAppCloseButton = fixture.debugElement.query(By.css(layoutAppCloseButtonSelector));
      expect(laoyoutAppCloseButton).toBeNull('layout toolbar should NOT be rendered');

      let onCloseEmitted: boolean = false;
      component.onClose.subscribe(
        () => onCloseEmitted = true,
        fail
      );
      component.withClose = true;
      fixture.detectChanges();
      await fixture.whenStable();
      layoutAppToolbar = fixture.debugElement.query(By.css(layoutAppToolbarSelector));
      expect(layoutAppToolbar).not.toBeNull('layout toolbar should be rendered');
      laoyoutAppCloseButton = fixture.debugElement.query(By.css(layoutAppCloseButtonSelector));
      expect(laoyoutAppCloseButton).not.toBeNull('layout toolbar close button should be rendered');
      laoyoutAppCloseButton.nativeElement.click();
      expect(onCloseEmitted).toBe(true);
    });
  });

  describe('via host', () => {
    let fixture: ComponentFixture<LayoutAppComponentTestHost>;
    let component: LayoutAppComponentTestHost;

    const testToolbarSelector: string = '.test-toolbar';
    const testToolbarContent: string = '[test_toolbar]';

    const testHeaderSelector: string = '.test-header';
    const testHeaderContent: string = '[test_header]';

    const testContentSelector: string = '.test-content';
    const testContentContent: string = '[test_content]';

    beforeEach(async () => {
      fixture = TestBed.createComponent(LayoutAppComponentTestHost);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should render app content', () => {
      let appContentElement: DebugElement;

      appContentElement = fixture.debugElement.query(By.css(testContentSelector));
      expect(appContentElement).not.toBeNull();
      expect(appContentElement.nativeElement.innerText).toBe(testContentContent);
    });

    it('should conditionally render header content', () => {
      let headerContentElement: DebugElement;

      component.enableHeader = true;
      fixture.detectChanges();
      headerContentElement = fixture.debugElement.query(By.css(testHeaderSelector));
      expect(headerContentElement).not.toBeNull();
      expect(headerContentElement.nativeElement.innerText).toBe(testHeaderContent);

      component.enableHeader = false;
      fixture.detectChanges();
      headerContentElement = fixture.debugElement.query(By.css(testHeaderSelector));
      expect(headerContentElement).toBeNull();
    });

    it('should conditionally render toolbar content', () => {
      let toolbarContentElement: DebugElement;

      component.enableToolbar = true;
      fixture.detectChanges();
      toolbarContentElement = fixture.debugElement.query(By.css(testToolbarSelector));
      expect(toolbarContentElement).not.toBeNull();
      expect(toolbarContentElement.nativeElement.innerText).toBe(testToolbarContent);

      component.enableToolbar = false;
      fixture.detectChanges();
      toolbarContentElement = fixture.debugElement.query(By.css(testToolbarSelector));
      expect(toolbarContentElement).toBeNull();
    });
  });
});
