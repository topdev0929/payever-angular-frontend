// tslint:disable max-classes-per-file
// tslint:disable no-console

import { RouterTestingModule } from '@angular/router/testing';
import { Component, NgModule, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule, Location as AngularLocation } from '@angular/common';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { timer } from 'rxjs';

import { LayoutTabComponent } from './layout-tab/layout-tab.component';
import { LayoutTabsetComponent } from './layout-tabset/layout-tabset.component';
import { LayoutTabInterface } from './layout-tab/layout-tab.interface';
import { imageUrlBase64Fixture } from '../../../test';
import { DevModeStubService } from '../../../dev';

const layoutTabHostComponentSelector: string = 'test-layout-tab-host-component';

@Component({
  selector: 'test-app',
  template: `<router-outlet></router-outlet>`
})
class LayoutTabAppTestComponent {}

@Component({
  selector: layoutTabHostComponentSelector,
  template: `
    <pe-layout-tabset [noPadding]="noPadding">
      <ng-container *ngFor="let tab of tabs">
        <pe-layout-tab
          [link]="tab.link"
          [svgIcon]="tab.svgIcon"
          [pngIcon]="tab.pngIcon"
          [noIconShadow]="tab.noIconShadow"
        >
        </pe-layout-tab>
      </ng-container>
    </pe-layout-tabset>
  `
})
class LayoutTabHostComponent {
  tabs: LayoutTabInterface[];
  noPadding: boolean = false;
}

@Component({
  selector: 'test-navigated-component',
  template: `
    <p class="test-navigated-component-content">
      {{ (route.data | async).content }}
    </p>
  `
})
class LayoutTabNavigatedTestComponent {
  constructor(
    public route: ActivatedRoute
  ) {}
}

const hostRoutePath: string = 'test-host';
const childRoutes: Route[] = [
  {
    path: 'test-link-1',
    component: LayoutTabNavigatedTestComponent,
    data: { content: '[test-link-1]' },
  }, {
    path: 'test-link-2',
    component: LayoutTabNavigatedTestComponent,
    data: { content: '[test-link-2]' },
  }, {
    path: 'test-link-3',
    component: LayoutTabNavigatedTestComponent,
    data: { content: '[test-link-3]' },
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterTestingModule.withRoutes([
      { path: '', pathMatch: 'full', redirectTo: hostRoutePath },
      {
        path: hostRoutePath,
        component: LayoutTabHostComponent,
        children: childRoutes
      }
    ])
  ],
  declarations: [
    LayoutTabComponent,
    LayoutTabsetComponent,
    LayoutTabHostComponent,
    LayoutTabAppTestComponent,
    LayoutTabNavigatedTestComponent,
  ],
  exports: [
    LayoutTabComponent,
    LayoutTabsetComponent,
    LayoutTabHostComponent,
    LayoutTabAppTestComponent,
    LayoutTabNavigatedTestComponent,
  ],
  providers: [
    DevModeStubService.provide(),
  ]
})
class LayoutTabTestModule {}

describe('LayoutTabComponent & LayoutTabsetComponent', () => {
  const tabsetSelector: string = '.ui-layout-tabset';
  const tabSelector: string = '.ui-layout-tab';
  const svgUseElementSelector: string = `${tabSelector} svg use`;
  const pngImgElementSelector: string = `${tabSelector} .icon-png`;
  const noIconShadowSelector: string = `${tabSelector}.no-shadow`;
  const noPaddingTabsetSelector: string = `${tabsetSelector}.no-padding`;

  describe('via host LayoutTabHostComponent', () => {
    let fixture: ComponentFixture<LayoutTabAppTestComponent>;
    let component: LayoutTabHostComponent;
    let router: Router;
    let location: AngularLocation;

    beforeEach(async () => {
      await TestBed
        .configureTestingModule({
          imports: [LayoutTabTestModule]
        })
        .compileComponents();
    });

    beforeEach(async () => {
      router = TestBed.get(Router);
      location = TestBed.get(AngularLocation);
      fixture = TestBed.createComponent(LayoutTabAppTestComponent);
      router.initialNavigation();
      await fixture.whenStable();
      component = fixture.debugElement.query(By.css(layoutTabHostComponentSelector)).componentInstance;
    });

    it('should render test host component', () => {
      expect(component).toBeDefined();
      expect(component instanceof LayoutTabHostComponent).toBe(true);
    });

    describe('LayoutTabComponent', () => {
      // NOTE: Would like to combine multiple inputs here to decrease tests time
      // (here every `it('...')` statement forces full app recompilation for
      // RouterTestingModule proper working).
      it('should accept any of @Input() link|svgIcon|pngIcon|noIconShadow', () => {
        let tab: DebugElement;
        let svgUseElement: DebugElement;
        let pngImgElement: DebugElement;
        let shadowTab: DebugElement;

        const link: string = `/${hostRoutePath}/${childRoutes[0].path}`;
        const svgIcon: string = 'test-svg-icon';
        const pngIcon: string = imageUrlBase64Fixture();

        fixture.detectChanges();

        component.tabs = [{
          link,
        }];
        fixture.detectChanges();
        tab = fixture.debugElement.query(By.css(tabSelector));
        expect(tab).not.toBeNull();
        expect((tab.componentInstance as LayoutTabComponent).link).toBe(link);
        svgUseElement = fixture.debugElement.query(By.css(svgUseElementSelector));
        expect(svgUseElement).toBeNull();
        pngImgElement = fixture.debugElement.query(By.css(pngImgElementSelector));
        expect(pngImgElement).toBeNull();
        shadowTab = fixture.debugElement.query(By.css(noIconShadowSelector));
        expect(pngImgElement).toBeNull();

        component.tabs = [{
          link,
          svgIcon
        }];
        fixture.detectChanges();
        svgUseElement = fixture.debugElement.query(By.css(svgUseElementSelector));
        expect(svgUseElement).not.toBeNull();
        expect((svgUseElement.nativeElement as SVGUseElement).getAttribute('xlink:href')).toBe(svgIcon);

        component.tabs = [{
          link,
          pngIcon
        }];
        fixture.detectChanges();
        pngImgElement = fixture.debugElement.query(By.css(pngImgElementSelector));
        expect(pngImgElement).not.toBeNull();
        expect((pngImgElement.nativeElement as HTMLImageElement).getAttribute('src')).toBe(pngIcon);

        component.tabs = [{
          link,
          noIconShadow: true
        }];
        fixture.detectChanges();
        shadowTab = fixture.debugElement.query(By.css(noIconShadowSelector));
        expect(shadowTab).not.toBeNull();
      });
    });

    describe('LayoutTabsetComponent', () => {
      it('should render multiple tabs and switch between them', async () => {
        let renderedTabs: DebugElement[];

        const tab1: LayoutTabInterface = {
          link: `/${hostRoutePath}/${childRoutes[0].path}`,
        };
        const tab2: LayoutTabInterface = {
          link: `/${hostRoutePath}/${childRoutes[1].path}`,
        };
        const tab3: LayoutTabInterface = {
          link: `/${hostRoutePath}/${childRoutes[2].path}`,
        };

        expect(location.path()).toBe(`/${hostRoutePath}`);

        component.tabs = [tab1, tab2, tab3];
        fixture.detectChanges();
        await fixture.whenStable();
        await timer(1).toPromise(); // fix routing, fakeAsync() won't work
        renderedTabs = fixture.debugElement.queryAll(By.css(tabSelector));
        expect(renderedTabs.length).toBe(3);
        expect((renderedTabs[0].componentInstance as LayoutTabComponent).link).toBe(tab1.link);
        expect((renderedTabs[1].componentInstance as LayoutTabComponent).link).toBe(tab2.link);
        expect((renderedTabs[2].componentInstance as LayoutTabComponent).link).toBe(tab3.link);
        expect((renderedTabs[0].componentInstance as LayoutTabComponent).active).toBeTruthy('First tab should be active by default');
        expect((renderedTabs[1].componentInstance as LayoutTabComponent).active).toBeFalsy();
        expect((renderedTabs[2].componentInstance as LayoutTabComponent).active).toBeFalsy();
        expect(location.path()).toBe(tab1.link, 'First tab link should be default after init');

        // Chec element clicking like e2e
        (renderedTabs[1].nativeElement as HTMLAnchorElement).click();
        await fixture.whenStable();
        await timer(1).toPromise(); // fix routing, fakeAsync() won't work
        renderedTabs = fixture.debugElement.queryAll(By.css(tabSelector));
        expect((renderedTabs[0].componentInstance as LayoutTabComponent).active).toBeFalsy();
        expect((renderedTabs[1].componentInstance as LayoutTabComponent).active).toBeTruthy();
        expect((renderedTabs[2].componentInstance as LayoutTabComponent).active).toBeFalsy();
        expect(location.path()).toBe(tab2.link);

        // Check direct API call
        await (renderedTabs[2].componentInstance as LayoutTabComponent).onTabClick(new MouseEvent('click'));
        renderedTabs = fixture.debugElement.queryAll(By.css(tabSelector));
        expect((renderedTabs[0].componentInstance as LayoutTabComponent).active).toBeFalsy();
        expect((renderedTabs[1].componentInstance as LayoutTabComponent).active).toBeFalsy();
        expect((renderedTabs[2].componentInstance as LayoutTabComponent).active).toBeTruthy();
        expect(location.path()).toBe(tab3.link);
      });

      it('should accept @Input() noPadding', () => {
        let noPaddingTabset: DebugElement;

        noPaddingTabset = fixture.debugElement.query(By.css(noPaddingTabsetSelector));
        expect(noPaddingTabset).toBeNull();

        component.noPadding = true;
        fixture.detectChanges();
        noPaddingTabset = fixture.debugElement.query(By.css(noPaddingTabsetSelector));
        expect(noPaddingTabset).not.toBeNull();
      });

      it('should produce error if navigation to tab failed', async () => {
        const brokenTab: LayoutTabInterface = {
          link: '/bad-link'
        };
        spyOn(console, 'warn');
        component.tabs = [brokenTab];
        fixture.detectChanges();
        await fixture.whenStable();
        await timer(1).toPromise(); // fix routing, fakeAsync() won't work
        expect((console.warn as jasmine.Spy).calls.count()).toBe(1);
        expect((console.warn as jasmine.Spy).calls.all().slice(-1)[0].args)
          .toContain(`LayoutTabsetComponent#selectTab() failed because router dont know ${brokenTab.link} link`);

        const renderedTab: DebugElement = fixture.debugElement.query(By.css(tabSelector));
        await (renderedTab.componentInstance as LayoutTabComponent).onTabClick(new MouseEvent('click'));
        // NOTE: After upgrade to Angular 6.1.7 we have non-fixed issue
        // `Navigation triggered outside Angular zone`. It's fresh and known issue:
        // https://github.com/angular/angular/issues/25837
        // While it not fixed, we should assert with `.toBeGreaterThanOrEqual()` for calls count
        // to have fallback when it will be fixed
        expect((console.warn as jasmine.Spy).calls.count()).toBeGreaterThanOrEqual(2);
        expect((console.warn as jasmine.Spy).calls.all().slice(-1)[0].args)
          .toContain(`LayoutTabsetComponent#selectTab() failed because router dont know ${brokenTab.link} link`);
      });
    });
  });

  describe('via other host', () => {
    @Component({
      template: `<pe-layout-tab link="/"></pe-layout-tab>`
    })
    class NoTabsetWrapperTestHostComponent {}

    beforeEach(async () => {
      TestBed.configureTestingModule({
        imports: [LayoutTabTestModule],
        declarations: [NoTabsetWrapperTestHostComponent]
      });
      await TestBed.compileComponents();
    });

    it('should throw error about not wrapped LayoutTabsetComponent', () => {
      let errorThrown: string;
      try {
        TestBed.createComponent(NoTabsetWrapperTestHostComponent);
      } catch (e) {
        errorThrown = e.toString();
      }
      expect(errorThrown).toBeTruthy();
      expect(errorThrown)
        .toContain('StaticInjectorError(Platform: core)[LayoutTabComponent -> LayoutTabsetComponent]: ');
    });
  });

});
