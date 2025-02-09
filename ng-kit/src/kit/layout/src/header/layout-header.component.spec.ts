// tslint:disable max-classes-per-file

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { APP_BASE_HREF, Location as AngularLocation } from '@angular/common';
import { Router, Route } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { LayoutHeaderComponent } from './layout-header.component';
import { LocationStubService, LocationService } from '../../../location';
import { LocationTestingModule } from '../../../location/testing';
import { RouteDataInterface } from '../route-data.interface';

@Component({
  selector: 'test-layout-header-host',
  template: `
    <pe-layout-header [defaultBackLinkHref]="defaultBackLinkHref"
                      [defaultBackLinkTitle]="defaultBackLinkTitle"
                      [notTransparent]="notTransparent"
                      [fullWidth]="fullWidth"
                      [showBackButton]="showBackButton">
      <div *ngIf="showColLeft" col-left>
        <p class="test-col-left-content">[test_col_left_content]</p>
      </div>
      <div *ngIf="showColCenter" col-center>
        <p class="test-col-center-content">[test_col_center_content]</p>
      </div>
      <div *ngIf="showColRight" col-right>
        <p class="test-col-right-content">[test_col_right_content]</p>
      </div>
    </pe-layout-header>
  `
})
class LayoutHeaderHostTestComponent {
  showColLeft: boolean = false;
  showColCenter: boolean = false;
  showColRight: boolean = false;
  defaultBackLinkHref: string;
  defaultBackLinkTitle: string;
  notTransparent: boolean;
  showBackButton: boolean = false;
  fullWidth: boolean = false;

  set showAll(showAll: boolean) {
    this.showColLeft = this.showColCenter = this.showColRight = showAll;
  }
}

@Component({
  selector: 'test-back-link',
  template: `[test_back_link]`
})
class TestBackComponent {}

@Component({
  selector: 'test-app',
  template: `<router-outlet></router-outlet>`
})
class TestAppComponent {}

@Component({
  selector: 'test-header-parent',
  template: `
    [HeaderParentTestComponent]
    <router-outlet></router-outlet>
  `
})
class HeaderParentTestComponent {}

describe('LayoutHeaderComponent', () => {
  const baseHref: string = 'http://example.com/';
  const layoutHeaderSelector: string = 'pe-layout-header';
  const layoutHeaderHostTestSelector: string = 'test-layout-header-host';
  const notTransparentSelector: string = '.is-not-transparent';
  const notFullWidthSelector: string = '.header-not-full-width';
  const backButtonSelector: string = '.layout-header-back-button';
  const defaultBackLink: string = 'back';
  const defaultBackLinkHref: string = `/${defaultBackLink}`;

  const customBackRoute: string[] = ['custom', 'back', 'link'];
  const headerWithBackRoute: Route & { data: RouteDataInterface } = {
    path: 'header-back-data',
    component: LayoutHeaderHostTestComponent,
    data: {
      backRoute: ['../', ...customBackRoute],
      backTitle: '[headerWithBackRouteData#backTitle]'
    }
  };
  const headerParentRoute: Route = {
    path: 'header-parent',
    component: HeaderParentTestComponent,
    children: [{
      path: 'header-child',
      component: LayoutHeaderHostTestComponent
    }]
  };

  let fixture: ComponentFixture<TestAppComponent>;
  let location: AngularLocation;
  let router: Router;
  let hostComponent: LayoutHeaderHostTestComponent;

  // NOTE: Cannot use nonRecompilableTestModuleHelper() because it not
  // works with many router.nativate()+fakeAsync initializations
  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        LocationTestingModule,
        RouterTestingModule.withRoutes([
          { path: '', pathMatch: 'full', redirectTo: 'header' },
          { path: defaultBackLink, component: TestBackComponent },
          { path: 'header', component: LayoutHeaderHostTestComponent },
          { ...headerParentRoute },
          { ...headerWithBackRoute },
          {
            path: customBackRoute[0],
            children: [{
              path: customBackRoute[1],
              children: [{
                path: customBackRoute[2],
                component: TestBackComponent
              }]
            }]
          }
        ])
      ],
      declarations: [
        TestAppComponent,
        TestBackComponent,
        LayoutHeaderComponent,
        HeaderParentTestComponent,
        LayoutHeaderHostTestComponent
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: baseHref }
      ]
    });

    await TestBed.compileComponents();
  });

  beforeEach(async () => {
    location = TestBed.get(AngularLocation);
    router = TestBed.get(Router);
    fixture = TestBed.createComponent(TestAppComponent);
    router.initialNavigation();
    await fixture.whenStable();
    hostComponent = fixture.debugElement.query(By.css(layoutHeaderHostTestSelector)).componentInstance;
  });

  it('should render host component', () => {
    expect(hostComponent).toBeDefined();
  });

  describe('via host', () => {
    const colLeftContentSelector: string = '.header-cols .test-col-left-content';
    const colLeftContent: string = '[test_col_left_content]';

    const colCenterContentSelector: string = '.header-cols .test-col-center-content';
    const colCenterContent: string = '[test_col_center_content]';

    const colRightContentSelector: string = '.header-cols .test-col-right-content';
    const colRightContent: string = '[test_col_right_content]';

    it('shoud render [col-left] content', () => {
      let colLeft: DebugElement;

      expect(hostComponent.showColLeft).toBe(false);
      colLeft = fixture.debugElement.query(By.css(colLeftContentSelector));
      expect(colLeft).toBeNull();

      hostComponent.showColLeft = true;
      hostComponent.showBackButton = true;
      fixture.detectChanges();
      colLeft = fixture.debugElement.query(By.css(colLeftContentSelector));
      expect(colLeft).not.toBeNull();
      expect(colLeft.nativeElement.textContent).toContain(colLeftContent);
    });

    it('shoud render [col-center] content', () => {
      let colCenter: DebugElement;

      expect(hostComponent.showColCenter).toBe(false);
      colCenter = fixture.debugElement.query(By.css(colCenterContentSelector));
      expect(colCenter).toBeNull();

      hostComponent.showColCenter = true;
      fixture.detectChanges();
      colCenter = fixture.debugElement.query(By.css(colCenterContentSelector));
      expect(colCenter).not.toBeNull();
      expect(colCenter.nativeElement.textContent).toContain(colCenterContent);
    });

    it('shoud render [col-right] content', () => {
      let colRight: DebugElement;

      expect(hostComponent.showColRight).toBe(false);
      colRight = fixture.debugElement.query(By.css(colRightContentSelector));
      expect(colRight).toBeNull();

      hostComponent.showColRight = true;
      fixture.detectChanges();
      colRight = fixture.debugElement.query(By.css(colRightContentSelector));
      expect(colRight).not.toBeNull();
      expect(colRight.nativeElement.textContent).toContain(colRightContent);
    });
  });

  describe('itself', () => {
    it('should accept @Input() showBackButton', () => {
      let backButton: DebugElement;

      hostComponent.showBackButton = false;
      fixture.detectChanges();
      backButton = fixture.debugElement.query(By.css(backButtonSelector));
      expect(backButton).toBeNull();

      hostComponent.showBackButton = true;
      fixture.detectChanges();
      backButton = fixture.debugElement.query(By.css(backButtonSelector));
      expect(backButton).not.toBeNull();
      expect((backButton.nativeElement as HTMLButtonElement) instanceof HTMLButtonElement).toBe(true);
    });

    it('should accept @Input() defaultBackLinkHref', () => {
      const windowLocationMocked: LocationStubService = TestBed.get(LocationService) as LocationStubService;

      hostComponent.showBackButton = true;
      hostComponent.defaultBackLinkHref = defaultBackLinkHref;
      fixture.detectChanges();

      const backButton: DebugElement = fixture.debugElement.query(By.css(backButtonSelector));
      expect(backButton).not.toBeNull();
      (backButton.nativeElement as HTMLButtonElement).click();
      expect(windowLocationMocked.href).toBe(defaultBackLinkHref);
    });

    it('should accept @Input() defaultBackLinkTitle', () => {
      const defaultBackLinkTitle: string = '[defaultBackLinkTitle]';
      hostComponent.showBackButton = true;
      hostComponent.defaultBackLinkTitle = defaultBackLinkTitle;
      fixture.detectChanges();

      const backButton: DebugElement = fixture.debugElement.query(By.css(backButtonSelector));
      expect((backButton.nativeElement as HTMLButtonElement).innerText).toContain(defaultBackLinkTitle);
    });

    it('shoulc accept @Input() notTransparent', () => {
      let nonTransparent: DebugElement;

      nonTransparent = fixture.debugElement.query(By.css(`${layoutHeaderSelector} ${notTransparentSelector}`));
      expect(nonTransparent).toBeNull('layout header should NOT be transparent by default');

      hostComponent.notTransparent = true;
      fixture.detectChanges();
      nonTransparent = fixture.debugElement.query(By.css(`${layoutHeaderSelector} ${notTransparentSelector}`));
      expect(nonTransparent).not.toBeNull('layout header should be transparent after set to true');

      hostComponent.notTransparent = false;
      fixture.detectChanges();
      nonTransparent = fixture.debugElement.query(By.css(`${layoutHeaderSelector} ${notTransparentSelector}`));
      expect(nonTransparent).toBeNull('layout header should NOT be transparent after set to false');
    });

    it('should accept @Input() fullWidth', () => {
      let notFullWidth: DebugElement;

      hostComponent.fullWidth = false;
      fixture.detectChanges();
      notFullWidth = fixture.debugElement.query(By.css(`${layoutHeaderSelector} ${notFullWidthSelector}`));
      expect(notFullWidth).not.toBeNull();

      hostComponent.fullWidth = true;
      fixture.detectChanges();
      notFullWidth = fixture.debugElement.query(By.css(`${layoutHeaderSelector} ${notFullWidthSelector}`));
      expect(notFullWidth).toBeNull();
    });
  });

  describe('with route data', () => {
    beforeEach(async () => {
      await router.navigate([headerWithBackRoute.path]);
      hostComponent = fixture.debugElement.query(By.css(layoutHeaderHostTestSelector)).componentInstance;
      expect(hostComponent).not.toBeNull(); // placed here to save tests time
      hostComponent.showBackButton = true;
      fixture.detectChanges();
    });

    it('should render backTitle from route data', () => {
      const backButton: DebugElement = fixture.debugElement.query(By.css(backButtonSelector));
      expect(backButton).not.toBeNull();
      expect((backButton.nativeElement as HTMLButtonElement).innerText)
        .toContain(headerWithBackRoute.data.backTitle);
    });

    it('should navigate to backRoute from route data', fakeAsync(() => {
      const backButton: DebugElement = fixture.debugElement.query(By.css(backButtonSelector));
      expect(backButton).not.toBeNull();
      (backButton.nativeElement as HTMLButtonElement).click();
      tick(300);
      expect(location.path()).toBe(`/${customBackRoute.join('/')}`);
    }));
  });

  describe('as child', () => {
    beforeEach(async () => {
      await router.navigate([headerParentRoute.path, headerParentRoute.children[0].path]);
      hostComponent = fixture.debugElement.query(By.css(layoutHeaderHostTestSelector)).componentInstance;
      expect(hostComponent).not.toBeNull(); // placed here to save tests time
      hostComponent.showBackButton = true;
      fixture.detectChanges();
    });

    it('should go to "../" when by default', fakeAsync(() => {
      const backButton: DebugElement = fixture.debugElement.query(By.css(backButtonSelector));
      expect(backButton).not.toBeNull();
      (backButton.nativeElement as HTMLButtonElement).click();
      tick(300);
      expect(location.path()).toBe(`/${headerParentRoute.path}`);
    }));
  });
});
