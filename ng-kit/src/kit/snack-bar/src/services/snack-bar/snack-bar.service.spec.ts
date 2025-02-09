import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';
import { TestBed, ComponentFixture, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import { SnackBarService } from './snack-bar.service';
import { NoopComponent } from '../../../../test';
import { SnackBarContentComponent } from '../../components';
import { SnackBarRef, SnackBarConfig, SnackBarVerticalPositionType } from '../../types';

@NgModule({
  imports: [
      NoopAnimationsModule,
      MatSnackBarModule
  ],
  declarations: [
      NoopComponent,
      SnackBarContentComponent,
  ],
  providers: [
    SnackBarService
  ],
  entryComponents: [
    SnackBarContentComponent
  ]
})
class TestModule {}

describe('SnackBarService', () => {
  let service: SnackBarService;
  let fixture: ComponentFixture<NoopComponent>;
  let defaultConfig: MatSnackBarConfig;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const snackBarContentSelector: string = 'pe-snack-bar-content';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestModule],
      providers: [
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(inject(
    [OverlayContainer, MAT_SNACK_BAR_DEFAULT_OPTIONS, SnackBarService],
    (oc: OverlayContainer, dc: MatSnackBarConfig, sbs: SnackBarService) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
      defaultConfig = dc;
      service = sbs;
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(NoopComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should show() and then hide() snackbar with text', fakeAsync(() => {
    const text: string = '[test-text]';
    let snackBar: HTMLElement;
    let ref: SnackBarRef;

    let wasShowed: boolean = false;
    service.isShowing$.subscribe(
      isShowing => wasShowed = isShowing,
      fail
    );

    expect(service.isShowing).toBe(false);
    ref = service.show(text);
    fixture.detectChanges();
    expect(ref).toBeTruthy();
    expect(ref instanceof MatSnackBarRef).toBe(true);
    tick(500);
    expect(service.isShowing).toBe(true);
    expect(wasShowed).toBe(true);
    snackBar = overlayContainerElement.querySelector(snackBarContentSelector);
    expect(snackBar).toBeTruthy();
    expect(snackBar.innerText).toContain(text);

    service.hide();
    fixture.detectChanges();
    tick(500);
    expect(service.isShowing).toBe(false);
    expect(wasShowed).toBe(false);
    snackBar = overlayContainerElement.querySelector(snackBarContentSelector);
    expect(snackBar).toBeFalsy();
  }));

  it('should toggle() snackbar', fakeAsync(() => {
    const text: string = '[test-toggle-text]';
    let snackBar: HTMLElement;
    let ref: SnackBarRef;

    expect(service.isShowing).toBe(false, 'self-test');

    ref = service.toggle(true, text);
    expect(ref).toBeTruthy();
    expect(ref instanceof MatSnackBarRef).toBe(true);
    fixture.detectChanges();
    tick(500);

    expect(service.isShowing).toBe(true);
    fixture.detectChanges();
    snackBar = overlayContainerElement.querySelector(snackBarContentSelector);
    expect(snackBar).toBeTruthy();
    expect(snackBar.innerText).toContain(text);

    ref = service.toggle(false, text);
    expect(ref).toBeNull();
    fixture.detectChanges();
    tick(500);
    expect(service.isShowing).toBe(false);
    snackBar = overlayContainerElement.querySelector(snackBarContentSelector);
    expect(snackBar).toBeFalsy();
  }));

  it('should not hide snack bar when opened and toggle() with another text', fakeAsync(() => {
    const text: string = '[test-not-toggle-text]';
    let ref: SnackBarRef;

    expect(service.isShowing).toBe(false, 'self-test');

    ref = service.toggle(true, text);
    fixture.detectChanges();
    tick(500);

    let wasDismissed: boolean = false;
    ref.afterDismissed().subscribe(
      () => wasDismissed = true,
      fail
    );
    expect(service.isShowing).toBe(true, 'should be showed after toggle');
    const otherText: string = '[test-not-toggle-other-text]';
    expect(text).not.toBe(otherText);
    expect(service.isShowing).toBe(true);
    service.toggle(false, otherText);
    fixture.detectChanges();
    tick(500);
    expect(service.isShowing).toBe(true);
    expect(wasDismissed).toBe(false);

    // Let remaining animations run.
    flush();
  }));

  it('should render html with show()', fakeAsync(() => {
    let contentRendered: HTMLElement;

    const contentInnerClassName: string = 'test-content-inner';
    const content: string = `
      <em class="${contentInnerClassName}">[text-html-content]</em>
    `;

    contentRendered = overlayContainerElement.querySelector(contentInnerClassName);
    expect(contentRendered).toBeFalsy('self-check');

    service.show(content);
    fixture.detectChanges();
    tick(500);

    expect(service.isShowing).toBe(true);
    contentRendered = overlayContainerElement.querySelector(`.${contentInnerClassName}`);
    expect(contentRendered).toBeTruthy('should render content with tags passed as params');

    flush();
  }));

  it('should pass all config options with show()', fakeAsync(() => {
    const text: string = '[test-options-text-show]';
    const config: SnackBarConfig = {
      duration: 123,
      position: SnackBarVerticalPositionType.Bottom, // should be not default
      iconId: '[test-options-icon-id]',
      iconSize: 321,
    };

    service.show(text, config);
    fixture.detectChanges();

    tick(config.duration - 1);
    expect(service.isShowing).toBe(true, 'shoud be shown before duration');

    const matSnackbarContainer: HTMLElement = overlayContainerElement.querySelector('.mat-snack-bar-container');
    expect(matSnackbarContainer).toBeTruthy();
    expect(matSnackbarContainer.classList.contains(`mat-snack-bar-container-place-${config.position}`))
      .toBe(true, 'shoud render proper position');

    const iconContainer: SVGElement = overlayContainerElement.querySelector('.snackbar-icon');
    expect(iconContainer).toBeTruthy();
    expect(iconContainer.classList.contains(`icon-${config.iconSize}`)).toBe(true);

    const iconTemplate: SVGUseElement = iconContainer.querySelector('use');
    expect(iconTemplate).toBeTruthy();
    expect(iconTemplate.getAttribute('xlink:href')).toBe(`#${config.iconId}`);

    tick(1); // expect duration will auto-hide snack-bar
    expect(service.isShowing).toBe(false, 'should hide snack-bar after duration end');
  }));

  it('should pass all config options with toggle()', fakeAsync(() => {
    const text: string = '[test-options-text-toggle]';
    const config: SnackBarConfig = {
      duration: 123,
      position: SnackBarVerticalPositionType.Bottom, // should be not default
      iconId: '[test-options-icon-id]',
      iconSize: 321,
    };

    service.toggle(true, text, config);
    fixture.detectChanges();

    tick(config.duration - 1);
    expect(service.isShowing).toBe(true, 'shoud be shown before duration');

    const matSnackbarContainer: HTMLElement = overlayContainerElement.querySelector('.mat-snack-bar-container');
    expect(matSnackbarContainer).toBeTruthy();
    expect(matSnackbarContainer.classList.contains(`mat-snack-bar-container-place-${config.position}`))
      .toBe(true, 'shoud render proper position');

    const iconContainer: SVGElement = overlayContainerElement.querySelector('.snackbar-icon');
    expect(iconContainer).toBeTruthy();
    expect(iconContainer.classList.contains(`icon-${config.iconSize}`)).toBe(true);

    const iconTemplate: SVGUseElement = iconContainer.querySelector('use');
    expect(iconTemplate).toBeTruthy();
    expect(iconTemplate.getAttribute('xlink:href')).toBe(`#${config.iconId}`);

    tick(1); // expect duration will auto-hide snack-bar
    expect(service.isShowing).toBe(false, 'should hide snack-bar after duration end');
  }));

  it('should accept default config options with .show()', fakeAsync(() => {
    const text: string = '[test-default-config-text-show]';

    defaultConfig.duration = 1123;
    service.show(text);
    fixture.detectChanges();

    tick(defaultConfig.duration - 1);
    expect(service.isShowing).toBe(true, 'shoud be shown before duration');

    tick(1); // expect duration will auto-hide snack-bar
    expect(service.isShowing).toBe(false, 'should hide snack-bar after duration end');

    flush();
  }));
});
