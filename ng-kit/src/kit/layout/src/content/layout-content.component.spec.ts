// tslint:disable max-classes-per-file

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LayoutService } from '../services';
import { nonRecompilableTestModuleHelper } from '../../../test';
import { LayoutContentComponent } from './layout-content.component';

describe('LayoutContentComponent', () => {
  describe('via host component', () => {
    let component: LayoutContentHostComponent;
    let fixture: ComponentFixture<LayoutContentHostComponent>;

    const layoutContentSelector: string = '.ui-layout-content';
    const sidebarOpenSelector: string = `${layoutContentSelector}.sidebar-open`;
    const noPaddingSelector: string = `${layoutContentSelector}.no-padding`;
    const showSidebarSelector: string = `${layoutContentSelector}.has-sidebar`;

    const contentMainSelector: string = `${layoutContentSelector} .ui-layout-content-main`;
    const contentLightGreySelector: string = `${contentMainSelector}.light-grey`;
    const bodyTransparentSelector: string = `${contentMainSelector}.transparent`;
    const collapsedSelector: string = `${contentMainSelector}.collapsed`;

    const sidebarContainerSelector: string = `${layoutContentSelector} .ui-layout-content-sidebar`;
    const sidebarTransparentSelector: string = `${sidebarContainerSelector}.transparent`;

    const contentClassName: string = 'test-content';
    const contentSelector: string = `.${contentClassName}`;
    const contentText: string = '[test_content]';

    const sidebarClassName: string = 'test-sidebar';
    const sidebarSelector: string = `.${sidebarClassName}`;
    const sidebarText: string = '[sidebar]';

    const noCollapseClassName: string = 'test-noCollapse';
    const noCollapseSelector: string = `.${noCollapseClassName}`;
    const noCollapseText: string = '[test_noCollapse]';

    @Component({
      template: `
        <pe-layout-content
          [showSidebar]="showSidebar"
          [noPadding]="noPadding"
          [contentLightGrey]="contentLightGrey"
          [bodyTransparent]="bodyTransparent"
          [sidebarTransparent]="sidebarTransparent"
          [collapsed]="collapsed"
        >
          <div *ngIf="showContent">
            <p class="${contentClassName}">${contentText}</p>
          </div>

          <div *ngIf="showSidebar" sidebar>
            <p class="${sidebarClassName}">${sidebarText}</p>
          </div>

          <div *ngIf="showNoCollapse" no-collapse>
            <p class="${noCollapseClassName}">${noCollapseText}</p>
          </div>
        </pe-layout-content>
      `
    })
    class LayoutContentHostComponent {
      noPadding: boolean = false;
      contentLightGrey: boolean = false;
      bodyTransparent: boolean = false;
      sidebarTransparent: boolean = false;
      collapsed: boolean = false;

      showContent: boolean = false;
      showSidebar: boolean = false;
      showNoCollapse: boolean = false;

      constructor(
        private layoutService: LayoutService
      ) {}

      toggleSidebarState(state: boolean): void {
        this.layoutService.sidebarToggleEvent.next(state);
      }
    }

    nonRecompilableTestModuleHelper({
      declarations: [
        LayoutContentComponent,
        LayoutContentHostComponent
      ],
      providers: [
        LayoutService
      ]
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(LayoutContentHostComponent);
      component = fixture.componentInstance;
    });

    it('should create component instance', () => {
      expect(component).toBeTruthy();
    });

    it('should render content', () => {
      let content: DebugElement;

      content = fixture.debugElement.query(By.css(contentSelector));
      expect(content).toBeFalsy();

      component.showContent = true;
      fixture.detectChanges();
      content = fixture.debugElement.query(By.css(contentSelector));
      expect(content).toBeTruthy();
      expect((content.nativeElement as HTMLParagraphElement).innerText).toBe(contentText);
    });

    it('should render [sidebar]', () => {
      let sidebar: DebugElement;

      sidebar = fixture.debugElement.query(By.css(sidebarSelector));
      expect(sidebar).toBeFalsy();

      component.showSidebar = true;
      fixture.detectChanges();
      sidebar = fixture.debugElement.query(By.css(sidebarSelector));
      expect(sidebar).toBeTruthy();
      expect((sidebar.nativeElement as HTMLParagraphElement).innerText).toBe(sidebarText);

      const layoutComponentShowedSidebar: DebugElement = fixture.debugElement.query(By.css(showSidebarSelector));
      expect(layoutComponentShowedSidebar).toBeTruthy();
    });

    it('should render [no-collapse]', () => {
      let noCollapse: DebugElement;

      noCollapse = fixture.debugElement.query(By.css(noCollapseSelector));
      expect(noCollapse).toBeFalsy();

      component.showNoCollapse = true;
      fixture.detectChanges();
      noCollapse = fixture.debugElement.query(By.css(noCollapseSelector));
      expect(noCollapse).toBeTruthy();
      expect((noCollapse.nativeElement as HTMLParagraphElement).innerText).toBe(noCollapseText);
    });

    it('should render different content on switch `collapsed` state', () => {
      let content: DebugElement;
      let noCollapse: DebugElement;
      let collapsed: DebugElement;

      component.showContent = true;
      component.showNoCollapse = true;
      fixture.detectChanges();

      // Set'n'test not collapsed
      component.collapsed = false;
      fixture.detectChanges();
      noCollapse = fixture.debugElement.query(By.css(noCollapseSelector));
      expect(noCollapse).toBeTruthy('[no-collapse] should be always rendered');
      collapsed = fixture.debugElement.query(By.css(collapsedSelector));
      expect(collapsed).toBeFalsy();
      content = fixture.debugElement.query(By.css(contentSelector));
      expect(content).toBeTruthy('content should be rendered when not collapsed');

      // Set'n'test collapsed
      component.collapsed = true;
      fixture.detectChanges();
      noCollapse = fixture.debugElement.query(By.css(noCollapseSelector));
      expect(noCollapse).toBeTruthy('[no-collapse] should be always rendered');
      collapsed = fixture.debugElement.query(By.css(collapsedSelector));
      expect(collapsed).toBeTruthy();
      content = fixture.debugElement.query(By.css(contentSelector));
      expect(content).toBeFalsy('content should NOT be rendered when collapsed');

      // Set'n'test collapsed, again
      component.collapsed = false;
      fixture.detectChanges();
      noCollapse = fixture.debugElement.query(By.css(noCollapseSelector));
      expect(noCollapse).toBeTruthy('[no-collapse] should be always rendered');
      collapsed = fixture.debugElement.query(By.css(collapsedSelector));
      expect(collapsed).toBeFalsy();
      content = fixture.debugElement.query(By.css(contentSelector));
      expect(content).toBeTruthy('content should be rendered when not collapsed');
    });

    it('should toggle sidebar open state', () => {
      let openedSidebar: DebugElement;

      component.showSidebar = true;
      fixture.detectChanges();

      openedSidebar = fixture.debugElement.query(By.css(sidebarOpenSelector));
      expect(openedSidebar).toBeFalsy('Sidebar should NOT be opened by default');

      component.toggleSidebarState(true);
      fixture.detectChanges();
      openedSidebar = fixture.debugElement.query(By.css(sidebarOpenSelector));
      expect(openedSidebar).toBeTruthy('Sidebar should be opened after toggle to true');

      component.toggleSidebarState(false);
      fixture.detectChanges();
      openedSidebar = fixture.debugElement.query(By.css(sidebarOpenSelector));
      expect(openedSidebar).toBeFalsy('Sidebar should be closed after toggle to false');
    });

    it('should accept @Input() noPadding', () => {
      let noPadding: DebugElement;

      noPadding = fixture.debugElement.query(By.css(noPaddingSelector));
      expect(noPadding).toBeFalsy('Should NOT have padding by default');

      component.noPadding = true;
      fixture.detectChanges();
      noPadding = fixture.debugElement.query(By.css(noPaddingSelector));
      expect(noPadding).toBeTruthy('Should have padding after option enable');

      component.noPadding = false;
      fixture.detectChanges();
      noPadding = fixture.debugElement.query(By.css(noPaddingSelector));
      expect(noPadding).toBeFalsy('Should NOT have padding after option disable');
    });

    it('should accept @Input() contentLightGrey', () => {
      let contentLightGrey: DebugElement;

      contentLightGrey = fixture.debugElement.query(By.css(contentLightGreySelector));
      expect(contentLightGrey).toBeFalsy('Should NOT have light grey colors by default');

      component.contentLightGrey = true;
      fixture.detectChanges();
      contentLightGrey = fixture.debugElement.query(By.css(contentLightGreySelector));
      expect(contentLightGrey).toBeTruthy('Should have light grey colors after option enable');

      component.contentLightGrey = false;
      fixture.detectChanges();
      contentLightGrey = fixture.debugElement.query(By.css(contentLightGreySelector));
      expect(contentLightGrey).toBeFalsy('Should NOT have light grey colors after option disable');
    });

    it('should accept @Input() bodyTransparent', () => {
      let bodyTransparent: DebugElement;

      bodyTransparent = fixture.debugElement.query(By.css(bodyTransparentSelector));
      expect(bodyTransparent).toBeFalsy('Should NOT have transparent body by default');

      component.bodyTransparent = true;
      fixture.detectChanges();
      bodyTransparent = fixture.debugElement.query(By.css(bodyTransparentSelector));
      expect(bodyTransparent).toBeTruthy('Should have transparent body after option enable');

      component.bodyTransparent = false;
      fixture.detectChanges();
      bodyTransparent = fixture.debugElement.query(By.css(bodyTransparentSelector));
      expect(bodyTransparent).toBeFalsy('Should NOT have transparent body after option disable');
    });

    it('should accept @Input() sidebarTransparent', () => {
      let sidebarTransparent: DebugElement;

      component.showSidebar = true;
      fixture.detectChanges();

      sidebarTransparent = fixture.debugElement.query(By.css(sidebarTransparentSelector));
      expect(sidebarTransparent).toBeFalsy('Should NOT have transparent sidebar by default');

      component.sidebarTransparent = true;
      fixture.detectChanges();
      sidebarTransparent = fixture.debugElement.query(By.css(sidebarTransparentSelector));
      expect(sidebarTransparent).toBeTruthy('Should have transparent sidebar after option enable');

      component.sidebarTransparent = false;
      fixture.detectChanges();
      sidebarTransparent = fixture.debugElement.query(By.css(sidebarTransparentSelector));
      expect(sidebarTransparent).toBeFalsy('Should NOT have transparent sidebar after option disable');
    });
  });
});
