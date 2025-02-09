import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutContentKitComponent } from './layout-content.component';

describe('LayoutContentKitComponent', () => {

  let component: LayoutContentKitComponent;
  let fixture: ComponentFixture<LayoutContentKitComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        LayoutContentKitComponent,
      ],
    });

    fixture = TestBed.createComponent(LayoutContentKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  describe('Constructor', () => {
    it('should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('Inputs', () => {
    it('should handle default value', () => {
      expect(component.noPadding).toBeUndefined();
      expect(component.noScroll).toBeUndefined();
      expect(component.collapsed).toBeFalsy();
      expect(component.showCaution).toBeFalsy();
    });
  });

});
