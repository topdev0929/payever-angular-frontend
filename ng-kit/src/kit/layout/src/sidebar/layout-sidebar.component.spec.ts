import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { nonRecompilableTestModuleHelper } from '../../../test';
import { LayoutSidebarComponent } from './layout-sidebar.component';

@Component({
  template: `
    <pe-layout-sidebar>
      <div *ngIf="showContent">
        <p class="test-layout-sidebar-content">[test_layout_sidebar_content]</p>
      </div>
    </pe-layout-sidebar>
  `
})
class LayoutSidebarHostTestComponent {
  showContent: boolean = false;
}

describe('LayoutSidebarComponent', () => {
  nonRecompilableTestModuleHelper({
    declarations: [
      LayoutSidebarComponent,
      LayoutSidebarHostTestComponent
    ]
  });

  describe('via host component', () => {
    let fixture: ComponentFixture<LayoutSidebarHostTestComponent>;
    let component: LayoutSidebarHostTestComponent;

    const layoutSidebarContentSelector: string = '.test-layout-sidebar-content';
    const layoutSidebarContentContent: string = '[test_layout_sidebar_content]';

    beforeEach(() => {
      fixture = TestBed.createComponent(LayoutSidebarHostTestComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create host component', () => {
      expect(component).toBeDefined();
    });

    it('should render content', () => {
      let content: DebugElement;

      content = fixture.debugElement.query(By.css(layoutSidebarContentSelector));
      expect(content).toBeNull();

      component.showContent = true;
      fixture.detectChanges();
      content = fixture.debugElement.query(By.css(layoutSidebarContentSelector));
      expect(content).not.toBeNull();
      expect((content.nativeElement as HTMLParagraphElement).textContent).toBe(layoutSidebarContentContent);
    });
  });
});
