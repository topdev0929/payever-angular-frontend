// tslint:disable max-file-line-count

import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { Component, NgModule } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { TranslateStubService } from '../../../../i18n';

import {
  DialogButtonListInterface,
  DialogComponentInterface,
  DialogButtonInterface,
  DialogButtonPresetsInterface,
  DialogConfigPresetsInterface,
  DialogConfigInterface
} from '../../interfaces';
import { DialogButtonListPresetName, DialogActions, DialogConfigPresetName } from '../../enums';
import { nonRecompilableTestModuleHelper, FakeOverlayContainer, fakeOverlayContainer, NoopComponent } from '../../../../test';
import { DialogModule } from '../../dialog.module';
import { DialogRef } from '../../classes';
import { DialogService } from '../../services';
import { DIALOG_BUTTON_PRESETS_TOKEN, DIALOG_CONFIG_PRESETS_TOKEN } from '../../constants';

@Component({
  template: `
    <pe-dialog [baseButtons]="baseButtons"
               [buttons]="buttons"
               [title]="title"
               [hasToolbar]="hasToolbar"
               [loading]="loading">
      <pe-dialog-content>
        <div class="dialog-container">
          <p class="dialog-test-content">[dialog_content]</p>
        </div>
      </pe-dialog-content>

      <div toolbar>
        <span class="toolbar-test-content">[dialog_toolbar]</span>
      </div>
    </pe-dialog>
  `
})
class DialogTestClientComponent implements DialogComponentInterface {
  title: string;
  loading: boolean;
  hasToolbar: boolean;
  buttons: DialogButtonListInterface = {};
  baseButtons: DialogButtonListPresetName;
  closed: boolean = false;
  dialogRef: DialogRef<DialogTestClientComponent>;

  // Need to close element after each test case
  close(): void {
    this.dialogRef.close();
    delete this.dialogRef;
    this.closed = true;
  }
}

// tslint:disable-next-line max-classes-per-file
@NgModule({
  imports: [
    NoopAnimationsModule,
    DialogModule,
  ],
  exports: [
    NoopComponent,
    DialogTestClientComponent
  ],
  declarations: [
    NoopComponent,
    DialogTestClientComponent
  ],
  entryComponents: [DialogTestClientComponent],
  providers: [TranslateStubService.provide()]
})
class DialogTestModule {}

describe('DialogComponent', () => {
  let component: DialogTestClientComponent;
  let noopFixture: ComponentFixture<NoopComponent>;
  let dialogService: DialogService;
  const { overlayContainerElement, fakeElementContainerProvider }: FakeOverlayContainer = fakeOverlayContainer();

  nonRecompilableTestModuleHelper({
    imports: [DialogTestModule],
    providers: [fakeElementContainerProvider],
  });

  beforeEach(async(() => {
    dialogService = TestBed.get(DialogService);
    noopFixture = TestBed.createComponent(NoopComponent);
  }));

  afterEach(() => {
    if (component && !component.closed) {
      component.close();
    }
    component = null;
  });

  describe('Self-tests', () => {
    it('should create overlayContainerElement', () => {
      expect(overlayContainerElement instanceof HTMLDivElement).toBe(true);
    });

    it('should create NoopComponent for detectChange() ability', () => {
      expect(noopFixture).toBeDefined();
    });
  });

  describe('Component options', () => {
    it('should render provided content in dialog after open via DialogService', () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;
      const testContent: HTMLElement = overlayContainerElement.querySelector('.dialog-test-content');
      expect(testContent).not.toBeNull();
      expect(testContent.innerHTML).toBe('[dialog_content]');
    });

    it('should render dialog title', () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;

      const testTitle: string = '[test_title]';
      component.title = testTitle;
      noopFixture.detectChanges();

      const title: HTMLElement = overlayContainerElement.querySelector('.mat-dialog-title');
      expect(title).not.toBeNull();
      expect(title.innerHTML).toBe(testTitle);
    });

    it('should render loading state', async () => {
      let spinner: HTMLElement;

      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.loading = false;
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      spinner = overlayContainerElement.querySelector('mat-spinner');
      expect(spinner).toBeNull('Should NOT render spinner while loading flag isn\'t setted');

      component.loading = true;
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      spinner = overlayContainerElement.querySelector('mat-spinner');
      expect(spinner).not.toBeNull('Should render spinner after loading flag has been setted');
    });

    it('should render toolbar', async () => {
      let toolbar: HTMLElement;

      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.hasToolbar = false;
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      toolbar = overlayContainerElement.querySelector('.toolbar-test-content');
      expect(toolbar).toBeNull('Toolbar should NOT be rendered while option is not setted');

      component.hasToolbar = true;
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      toolbar = overlayContainerElement.querySelector('.toolbar-test-content');
      expect(toolbar).not.toBeNull('Toolbar should be rendered after option is setted');
      expect(toolbar.innerHTML).toBe('[dialog_toolbar]');
    });

    it('should open/close() dialog and have dialogRef to be defined while dialog is opened', async () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.buttons = { testButton: { click: DialogActions.Close } };
      noopFixture.detectChanges();
      await noopFixture.whenStable();

      expect(component.dialogRef).toBeDefined('dialogRef should be defined');
      expect(overlayContainerElement.innerHTML).toContain('[dialog_content]');

      component.close();
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      expect(component.dialogRef).not.toBeDefined('dialogRef should NOT be defined');
      expect(overlayContainerElement.innerHTML).not.toContain('[dialog_content]');
    });
  });

  describe('[buttons]', () => {
    it('should render buttons was specified', async () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;

      const testButton: DialogButtonInterface = {
        classes: 'test-button-class',
        color: 'primary',
        text: '[test_button_text]',
      };

      component.buttons = { testButton };
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      const renderedTestButton: HTMLButtonElement = overlayContainerElement.querySelector(`.${testButton.classes}`);
      expect(renderedTestButton).not.toBeNull('Should render test button with preset class');
      expect(renderedTestButton.attributes['mat-button']).toBeDefined();
      expect(renderedTestButton.type).toBe('button');
      expect(renderedTestButton.getAttribute('ng-reflect-color')).toBe(testButton.color);
      expect(renderedTestButton.innerHTML).toContain(testButton.text);
    });

    it('should set "disabled" state for button when provided, dynamically', async () => {
      let renderedTestButton: HTMLButtonElement;

      const testButton: DialogButtonInterface = {
        classes: 'test-button-class',
        disabled: true,
      };

      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.buttons = { testButton };
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      renderedTestButton = overlayContainerElement.querySelector(`.${testButton.classes}`);
      expect(renderedTestButton.disabled).toBe(true);

      component.buttons = { testButton: { ...testButton, disabled: false } };
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      renderedTestButton = overlayContainerElement.querySelector(`.${testButton.classes}`);
      expect(renderedTestButton.disabled).toBe(false);
    });

    it('should set "disabled" all buttons while .loading=true and not for Close/Dismiss buttons', async () => {
      let renderedTestButton: HTMLButtonElement;

      const testButton: DialogButtonInterface = {
        classes: 'test-button-class',
        disabled: false,
      };

      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.buttons = { testButton };
      component.loading = true;
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      renderedTestButton = overlayContainerElement.querySelector(`.${testButton.classes}`);
      expect(renderedTestButton.disabled).toBe(true, 'Should be disabled despite "disabled" setting');

      component.loading = false;
      noopFixture.detectChanges();
      await noopFixture.whenStable();
      expect(renderedTestButton.disabled).toBe(false, 'Should NOT be disabled according "loading" setting changed');
    });

    it('should render multiple buttons and sort them by "order" option', async () => {
      let renderedTestButton1: HTMLButtonElement;
      let renderedTestButton2: HTMLButtonElement;
      let renderedTestButton3: HTMLButtonElement;

      const testButton1: DialogButtonInterface = {
        classes: 'test-button-1',
        order: 2,
      };
      const testButton2: DialogButtonInterface = {
        classes: 'test-button-2',
        order: 5,
      };
      const testButton3: DialogButtonInterface = {
        classes: 'test-button-3',
        order: -2,
      };

      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.buttons = { testButton1, testButton2, testButton3 };
      noopFixture.detectChanges();
      await noopFixture.whenStable();

      renderedTestButton1 = overlayContainerElement.querySelector(`.${testButton1.classes}`);
      expect(renderedTestButton1).not.toBeNull();

      renderedTestButton2 = overlayContainerElement.querySelector(`.${testButton2.classes}`);
      expect(renderedTestButton2).not.toBeNull();

      renderedTestButton3 = overlayContainerElement.querySelector(`.${testButton3.classes}`);
      expect(renderedTestButton3).not.toBeNull();

      const buttons: HTMLButtonElement[] = Array.from(overlayContainerElement.querySelectorAll('button'));
      expect(buttons.length).toBe(3);
      expect(buttons[0].className).toContain(testButton3.classes, 'testButton3 should be FIRST');
      expect(buttons[1].className).toContain(testButton1.classes, 'testButton1 should be SECOND');
      expect(buttons[2].className).toContain(testButton2.classes, 'testButton2 should be LAST');
    });

    it('should invoke .click() callback when provided', async () => {
      let renderedTestButton: HTMLButtonElement;

      const testButton = {
        click: () => { /* not empty block */ },
        classes: 'test-button-class'
      };

      spyOn(testButton, 'click');

      component = dialogService.open(DialogTestClientComponent).componentInstance;

      component.buttons = { testButton };
      noopFixture.detectChanges();
      await noopFixture.whenStable();

      renderedTestButton = overlayContainerElement.querySelector(`button.${testButton.classes}`);
      expect(renderedTestButton).not.toBeNull();

      renderedTestButton.click();
      expect(testButton.click).toHaveBeenCalled();
    });
  });

  describe('DialogActions.#', () => {
    let renderedTestButton: HTMLButtonElement;

    it('should close dialog for specified DialogActions.Close and return dialogResult', async () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;

      const testButton: DialogButtonInterface = {
        classes: 'test-button-classsss',
        click: DialogActions.Close,
        text: '[close]',
        dialogResult: new BehaviorSubject('[test_dialog_result]')
      };

      component.buttons = { testButton };
      noopFixture.detectChanges();
      await noopFixture.whenStable();

      component.dialogRef.afterClosed()
        .subscribe(
          dialogResult =>
            expect(dialogResult).toBe(
              (component.buttons.testButton.dialogResult as BehaviorSubject<string>).getValue()
            ),
          fail
        );

      renderedTestButton = overlayContainerElement.querySelector(`button.${testButton.classes}`);
      expect(renderedTestButton).not.toBeNull('renderedTestButton should be rendered');
      expect(renderedTestButton.innerText).toContain(testButton.text);
      renderedTestButton.click();
    });

    it('should close dialog for specified DialogActions.Dismiss and return false', async () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;

      const testButton: DialogButtonInterface = {
        classes: 'test-button-classsss',
        text: '[dismiss]',
        click: DialogActions.Dismiss,
      };

      component.buttons = {
        testButton: {
          ...testButton,
        }
      };
      noopFixture.detectChanges();
      await noopFixture.whenStable();

      component.dialogRef.afterClosed()
        .subscribe(
          dialogResult => expect(dialogResult).toBe(false),
          fail
        );

      renderedTestButton = overlayContainerElement.querySelector(`button.${testButton.classes}`);
      expect(renderedTestButton).not.toBeNull('renderedTestButton should be rendered');
      expect(renderedTestButton.innerText).toContain(testButton.text);
      renderedTestButton.click();
    });

    it('should close dialog for specified DialogActions.Success and return false', async () => {
      component = dialogService.open(DialogTestClientComponent).componentInstance;

      const testButton: DialogButtonInterface = {
        classes: 'test-button-classsss',
        text: '[success]',
        click: DialogActions.Success,
      };

      component.buttons = { testButton };
      noopFixture.detectChanges();
      await noopFixture.whenStable();

      component.dialogRef.afterClosed()
        .subscribe(
          dialogResult => expect(dialogResult).toBe(true),
          fail
        );

      renderedTestButton = overlayContainerElement.querySelector(`button.${testButton.classes}`);
      expect(renderedTestButton).not.toBeNull('renderedTestButton should be rendered');
      expect(renderedTestButton.innerText).toContain(testButton.text);
      renderedTestButton.click();
    });
  });

  describe('[baseButtons]', () => {
    const buttonListPresetNames: string[] = Object.keys(DialogButtonListPresetName);
    let dialogButtonsPresets: DialogButtonPresetsInterface;

    beforeEach(() => {
      dialogButtonsPresets = TestBed.get(DIALOG_BUTTON_PRESETS_TOKEN);
    });

    it('(self-test) should check buttonListPresetNames size', () => {
      expect(buttonListPresetNames.length).toBeGreaterThan(0);
    });

    // Dymanic preset tests
    buttonListPresetNames.forEach(key => {
      it(`should render DialogButtonListPresetName.${key} when provided`, async () => {
        const preset: DialogButtonListInterface = dialogButtonsPresets[DialogButtonListPresetName[key]];
        const presetButtonNames: string[] = Object.keys(preset);
        expect(presetButtonNames.length).toBeGreaterThan(0, 'No empty presets');

        component = dialogService.open(DialogTestClientComponent).componentInstance;

        component.baseButtons = DialogButtonListPresetName[key];
        noopFixture.detectChanges();
        await noopFixture.whenStable();

        presetButtonNames.forEach(buttonName => {
          const selector: string = preset[buttonName].classes
            .split(/\s+/)
            .map(className => `.${className}`).join('');
          const buttonElement: HTMLButtonElement = overlayContainerElement.querySelector(selector);
          expect(buttonElement).not.toBeNull();
          expect(buttonElement.textContent).toContain(preset[buttonName].text);
        });
      });
    });
  });

  describe('Size presets', () => {
    const sizePresetNames: string[] = Object.keys(DialogConfigPresetName);
    let sizePresets: DialogConfigPresetsInterface;

    beforeEach(() => {
      sizePresets = TestBed.get(DIALOG_CONFIG_PRESETS_TOKEN);
    });

    it('(self-test) should check buttonListPresetNames size', () => {
      expect(sizePresetNames.length).toBeGreaterThan(0);
    });

    sizePresetNames.forEach(sizePresetNameKey => {
      it(`should render DialogConfigPresetName.${sizePresetNameKey} when provided`, async () => {
        const sizePresetName: DialogConfigPresetName = DialogConfigPresetName[sizePresetNameKey];
        component = dialogService.open(DialogTestClientComponent, sizePresetName).componentInstance;
        noopFixture.detectChanges();
        await noopFixture.whenStable();

        const sizePreset: DialogConfigInterface = sizePresets[sizePresetName];
        expect(sizePreset).toBeDefined();
        const selector: string = [].concat(sizePreset.panelClass).map(className => `.${className}`).join('');
        const panel: HTMLElement = overlayContainerElement.querySelector(selector);
        expect(panel).not.toBeNull();
      });
    });
  });
});
