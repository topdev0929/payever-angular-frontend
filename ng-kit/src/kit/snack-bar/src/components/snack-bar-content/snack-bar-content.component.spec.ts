import { SnackBarContentComponent } from './snack-bar-content.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { nonRecompilableTestModuleHelper } from '../../../../test';
import { SnackBarDataInterface } from '../../types';

describe('SnackBarContentComponent', () => {
  let fixture: ComponentFixture<SnackBarContentComponent>;
  let component: SnackBarContentComponent;

  const iconContainerSelector: string = '.snackbar-icon';
  const iconTemplateSelector: string = '.snackbar-icon use';
  const iconTemplateAttr: string = 'xlink:href';
  const defaultIconSize: number = 24;

  const sharedDataProto: SnackBarDataInterface = {
    iconId: '[proto-icon-id]',
    iconSize: 24,
    content: '[proto-content]'
  };
  let sharedData: SnackBarDataInterface;

  nonRecompilableTestModuleHelper({
    declarations: [
      SnackBarContentComponent
    ],
    providers: [
      { provide: MAT_SNACK_BAR_DATA, useValue: sharedDataProto },
      { provide: MatSnackBarRef, useValue: {}}
    ]
  });

  beforeEach(() => {
    sharedData = TestBed.get(MAT_SNACK_BAR_DATA);
    fixture = TestBed.createComponent(SnackBarContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Recover shared data
    Object.assign(sharedData, sharedDataProto);
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should accept data', () => {
    expect(component.data).toBe(sharedData);
    expect(component.data).toEqual(sharedDataProto);
    const newData: SnackBarDataInterface = Object.assign(sharedData, {
      iconId: '[new-icon-id]',
      iconSize: 240,
      content: '[new-content]'
    });
    expect(sharedData).toEqual(newData, 'self-test');
    expect(component.data).toEqual(newData);
  });

  it('should accept data.iconId', () => {
    let iconTemplate: DebugElement;

    const iconIdWas: string = sharedData.iconId;
    iconTemplate = fixture.debugElement.query(By.css(iconTemplateSelector));
    expect(iconIdWas).toBeTruthy('self-test');
    expect(iconTemplate).toBeTruthy('icon element should be rendered as far iconId property provided');
    expect((iconTemplate.nativeElement as SVGUseElement).getAttribute(iconTemplateAttr)).toBe(`#${iconIdWas}`);

    const newIconid: string = '[test-icon-id]';
    sharedData.iconId = newIconid;
    fixture.detectChanges();
    iconTemplate = fixture.debugElement.query(By.css(iconTemplateSelector));
    expect(iconTemplate).toBeTruthy('icon element should be rendered after property change');
    expect((iconTemplate.nativeElement as SVGUseElement).getAttribute(iconTemplateAttr)).toBe(`#${newIconid}`);

    sharedData.iconId = null;
    fixture.detectChanges();
    iconTemplate = fixture.debugElement.query(By.css(iconTemplateSelector));
    expect(iconTemplate).toBeFalsy('icon element should NOT be rendered after property change to null');

    sharedData.iconId = iconIdWas;
    fixture.detectChanges();
    iconTemplate = fixture.debugElement.query(By.css(iconTemplateSelector));
    expect(iconTemplate).toBeTruthy('icon element should be rendered after property change to initial');
  });

  it('should accept data.iconsSize', () => {
    let iconContainer: DebugElement;
    let iconClassName: SVGAnimatedString;
    let methodClassName: string;
    let iconSize: number;

    // Provide initial iconSize
    iconSize = 123;
    sharedData.iconSize = iconSize;
    expect(sharedData.iconSize).toBeTruthy('self-test');
    fixture.detectChanges();
    iconContainer = fixture.debugElement.query(By.css(iconContainerSelector));
    expect(iconContainer).toBeTruthy();
    iconClassName = (iconContainer.nativeElement as SVGElement).className;
    methodClassName = component.iconClass;
    expect(methodClassName).toContain(String(iconSize));
    expect(iconClassName.baseVal).toContain(methodClassName);

    // Change value
    iconSize = 321;
    sharedData.iconSize = iconSize;
    expect(sharedData.iconSize).toBeTruthy('self-test');
    fixture.detectChanges();
    iconContainer = fixture.debugElement.query(By.css(iconContainerSelector));
    expect(iconContainer).toBeTruthy();
    iconClassName = (iconContainer.nativeElement as SVGElement).className;
    methodClassName = component.iconClass;
    expect(methodClassName).toContain(String(iconSize));
    expect(iconClassName.baseVal).toContain(methodClassName);

    // Not-provided icon size
    iconSize = null;
    sharedData.iconSize = iconSize;
    expect(sharedData.iconSize).toBeFalsy('self-test');
    fixture.detectChanges();
    iconContainer = fixture.debugElement.query(By.css(iconContainerSelector));
    expect(iconContainer).toBeTruthy();
    iconClassName = (iconContainer.nativeElement as SVGElement).className;
    methodClassName = component.iconClass;
    expect(methodClassName).toContain(String(defaultIconSize));
    expect(iconClassName.baseVal).toContain(methodClassName);
  });

  it('should render data.content', () => {
    let content: HTMLSpanElement;
    const contentTemplateClassName: string = 'test-data-content';
    const contentTemplate: string = `
      <span class="${contentTemplateClassName}"></span>
    `;

    sharedData.content = contentTemplate;
    fixture.detectChanges();
    content = fixture.nativeElement.querySelector(`.${contentTemplateClassName}`);
    expect(content).toBeTruthy();
    expect(content.outerHTML.trim()).toBe(contentTemplate.trim());
  });
});
