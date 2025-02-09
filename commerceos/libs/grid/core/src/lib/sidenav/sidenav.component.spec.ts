import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';

import { PeGridService } from '../grid.service';

import { PeGridSidenavComponent } from './sidenav.component';

describe('PeGridSidenavComponent', () => {
  let fixture: ComponentFixture<PeGridSidenavComponent>;
  let component: PeGridSidenavComponent;

  const gridService: any = {
    embedMod: true,
    theme: 'dark',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PeGridSidenavComponent],
      imports: [CommonModule, OverlayModule, MatIconModule],
      providers: [{ provide: PeGridService, useValue: gridService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PeGridSidenavComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should not show the open menu button when sidenavMenu is undefined', () => {
    const button = fixture.debugElement.query(By.css('.pe-grid-sidenav__menu'));
    expect(button).toBeNull();
  });

  it('should not show the open menu button when sidenavMenu is defined and mobileView is true', () => {
    const button = getButton(component, fixture, { items: [] }, true);
    expect(button).toBeNull();
  });

  it('should show the open menu button when sidenavMenu is defined and mobileView is false', () => {
    const button = getButton(component, fixture);
    expect(button).toBeDefined();
  });

  it('if menuOpened is true then button must have pe-grid-sidenav__menu_opened class', () => {
    component.menuOpened = true;
    const button = getButtonHtmlElement(component, fixture);
    expect(button.classList.contains('pe-grid-sidenav__menu_opened')).toBe(true);
  });

  it('if menuOpened is false then button must not have pe-grid-sidenav__menu_opened class', () => {
    component.menuOpened = false;
    const button = getButtonHtmlElement(component, fixture);
    expect(button.classList.contains('pe-grid-sidenav__menu_opened')).toBe(false);
  });
});

function getButtonHtmlElement(
  component: PeGridSidenavComponent,
  fixture: ComponentFixture<PeGridSidenavComponent>,
): HTMLElement {
  const button = getButton(component, fixture);

  return button.nativeElement as HTMLElement;
}

function getButton(
  component: PeGridSidenavComponent,
  fixture: ComponentFixture<PeGridSidenavComponent>,
  sidenavMenu = { items: [] },
  mobileView = false,
) {
  component.sidenavMenu = sidenavMenu;
  component.mobileView = mobileView;
  fixture.detectChanges();

  const button = fixture.debugElement.query(By.css('.pe-grid-sidenav__menu'));

  return button;
}
