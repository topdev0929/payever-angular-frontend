import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AutocompleteComponent } from './autocomplete.component';
import { nonRecompilableTestModuleHelper, fakeOverlayContainer, FakeOverlayContainer } from '../../../../test';
import { AutocompleteChangeEvent, AutocompleteOptions } from '../../interfaces';
import { FormCoreModule } from '../../../../form-core/form-core.module';

describe('AutocompleteComponent', () => {
  let fixture: ComponentFixture<AutocompleteComponent>;
  let component: AutocompleteComponent;

  const {
    overlayContainerElement,
    fakeElementContainerProvider,
  }: FakeOverlayContainer = fakeOverlayContainer();

  nonRecompilableTestModuleHelper({
    imports: [
      FormsModule,
      ReactiveFormsModule,
      MatIconModule,
      MatProgressSpinnerModule,
      MatInputModule,
      MatFormFieldModule,
      MatAutocompleteModule,
      NoopAnimationsModule,
      FormCoreModule
    ],
    declarations: [
      AutocompleteComponent
    ],
    providers: [
      fakeElementContainerProvider
    ]
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutocompleteComponent);
    component = fixture.componentInstance;
  });

  describe('without initialization', () => {
    it('should throw an error if no FormControl provided', () => {
      expect(component.formControl).toBeFalsy('self-test');
      expect(() => {
        fixture.detectChanges();
      }).toThrowError();
    });
  });

  describe('with initialization', () => {
    beforeEach(() => {
      component.formControl = new FormControl();
      fixture.detectChanges();
    });

    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    describe('plain inputs', () => {
      it('should render @Input("aria-label")', () => {
        const ariaLabel: string = '[test-ariaLabel]';
        component.ariaLabel = ariaLabel;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css(`input[aria-label="${ariaLabel}"`))).toBeTruthy();
      });

      it('should provide @Input("classList")', async () => {
        const className: string = 'test-class-name';
        component.classList = className;
        fixture.detectChanges();
        await fixture.detectChanges();
        component.trigger.openPanel();
        fixture.detectChanges();
        expect(overlayContainerElement.querySelector(`.${className}`)).toBeTruthy();
      });

      it('should provide @Input() autoActiveFirstOption to mat-autocomplete', () => {
        let matAutocomplete: DebugElement;

        component.autoActiveFirstOption = false;
        fixture.detectChanges();
        matAutocomplete = fixture.debugElement.query(By.css('mat-autocomplete'));
        expect(matAutocomplete).toBeTruthy();

        component.autoActiveFirstOption = true;
        fixture.detectChanges();
        matAutocomplete = fixture.debugElement.query(By.css('mat-autocomplete'));
        expect(matAutocomplete).toBeTruthy();
        expect(matAutocomplete.attributes['ng-reflect-auto-active-first-option']).toBe('true');
      });
    });

    describe('options render logic', () => {
      it('should process @Input() displayByField for getDisplayValue()', () => {
        const displayByFieldKey: string = '[test-displayByField-key]';
        const option: object = {
          [displayByFieldKey]: '[test-displayByField-value]'
        };
        component.displayByField = displayByFieldKey;
        expect(component.getDisplayValue(option)).toBe(option[displayByFieldKey]);
      });

      it('should process @Input() displayByField for getDisplayWithCallback()', () => {
        expect(component.getDisplayWithCallback()).toBeNull();

        const displayByField: string = '[test-displayByField]';
        component.displayByField = displayByField;
        const callback: Function = component.getDisplayWithCallback();
        expect(typeof callback).toBe('function');

        const value: string = '[test-value]';
        expect(callback({ [displayByField]: value })).toBe(value);

        component.displayByField = null;
        expect(callback({ [displayByField]: value }))
          .toBeNull('occasionally nulled displayByField param should return null');
      });

      it('should process @Input() displayWith for getDisplayValue()', () => {
        const option: object = {
          '[test-key]': '[test-value]'
        };

        let passedValue: object;
        const returnedValue: string = '[test-return-value-displayWith]';
        component.displayWith = (passed: object): string => {
          passedValue = passed;
          return returnedValue;
        };

        expect(passedValue).toBeUndefined();
        expect(component.getDisplayValue(option)).toBe(returnedValue);
        expect(passedValue).toBe(option);
      });

      it('should return displayWith for displayWithCallback()', () => {
        const displayWith: () => string = () => '[empty-string]';
        component.displayWith = displayWith;
        expect(component.getDisplayWithCallback()).toBe(displayWith);
      });

      it('should return null if no option provided for getDisplayValue()', () => {
        expect(component.getDisplayValue(null)).toBeNull();
      });

      it('should return option if option is string and neither of "displayWith" or "displayByField" options provided', () => {
        const option: string = '[test-string-option]';
        expect(() => {
          expect(component.getDisplayValue(option)).toBe(option);
        }).not.toThrowError();
      });

      it('should return value if neither of "displayWith" or "displayByField" options provided', () => {
        expect(() => {
          component.getDisplayValue({});
        }).toThrowError();
      });
    });

    describe('options filter logic', () => {
      it('should use @Input("filter") option when provided', () => {
        let filteredOptions: AutocompleteOptions;
        component.filteredOptions.subscribe(
          options => filteredOptions = options,
          fail
        );

        const testValue: string = '[test-value]';
        component.value = testValue;
        expect(filteredOptions).toBeUndefined();

        const filterReturnValues: AutocompleteOptions = [1, 2, 3];
        component.filter = jasmine.createSpy('filter').and.returnValue(filterReturnValues);
        component.options = filterReturnValues;
        component.value = testValue;
        expect(filteredOptions).toBe(filterReturnValues);
        expect(component.filter).toHaveBeenCalledWith(component.options, testValue);

        const customOptions: AutocompleteOptions = [4, 5, 6];
        component.options = customOptions;
        component.value = testValue;
        expect(filteredOptions).toBe(filterReturnValues);
        expect(component.filter).toHaveBeenCalledWith(customOptions, testValue);
      });

      it('should use @Input("filterByField") when provided', () => {
        let filteredOptions: AutocompleteOptions;
        component.filteredOptions.subscribe(
          options => filteredOptions = options,
          fail
        );

        const searchKey: string = '[searchKey]';
        const options: AutocompleteOptions = [
          { [searchKey]: 'xmatchedValue' },
          { [searchKey]: 'xnonMatchedValue' },
          { [searchKey]: 'xsomeOtherValue' },
          { [`${searchKey}-junk-key`]: 'xjunkOtherValue' },
        ];
        component.options = options;
        component.filterByField = searchKey;

        component.value = options[0][searchKey];
        expect(filteredOptions).toContain(options[0]);
        expect(filteredOptions.length).toBe(1);

        component.value = options[1][searchKey];
        expect(filteredOptions).toContain(options[1]);
        expect(filteredOptions.length).toBe(1);

        component.value = options[0][searchKey].slice(0, 3);
        expect(filteredOptions).toContain(options[0]);
        expect(filteredOptions.length).toBe(1);

        component.value = 'Value';
        expect(filteredOptions.length).toBe(0);

        component.value = 'x';
        expect(filteredOptions.length).toBe(3);

        component.value = 'X'; // case-sensitive
        expect(filteredOptions.length).toBe(3);

        component.value = 'm';
        expect(filteredOptions.length).toBe(0);
      });

      it('should auto-filtrate options if this is strings array', () => {
        let filteredOptions: AutocompleteOptions;
        component.filteredOptions.subscribe(
          options => filteredOptions = options,
          fail
        );

        const options: AutocompleteOptions = [
          'option 1',
          'option 2',
          'non-option'
        ];
        component.options = options;
        component.value = 'opti';
        expect(filteredOptions).toBeTruthy();
        expect(filteredOptions).toEqual([options[0], options[1]]);
      });

      it('should produce an error if no filter for options specified', () => {
        let filteredOptions: AutocompleteOptions;
        component.filteredOptions.subscribe(
          options => filteredOptions = options,
          fail
        );
        expect(filteredOptions).toBeUndefined();

        const options: AutocompleteOptions = [
          { key: 'value' }
        ];
        component.options = options;
        spyOn(console, 'warn');
        component.value = 'va';
        // tslint:disable-next-line no-console
        expect(console.warn).toHaveBeenCalledWith('Impossible to filter, please provide "filter" callback or "filterByField" to autocomplete');
        expect(filteredOptions).toEqual([]);
      });
    });

    describe('Output parameters', () => {
      it('shold notice with @Output("valueChange")', async () => {
        let valueChanged: string;
        component.valueChange.subscribe(
          ({ value }: AutocompleteChangeEvent) => valueChanged = value,
          fail
        );

        const options: AutocompleteOptions = [
          { value: 'target option 1' },
          { value: 'target option 2' },
        ];
        component.options = options;
        component.filterByField = 'value';
        component.displayByField = 'value';
        fixture.detectChanges();
        await fixture.whenStable();

        // Emulate first option select
        component.trigger.openPanel();
        component.value = 'targ';
        fixture.detectChanges();
        const firstOption: HTMLElement = overlayContainerElement.querySelector('mat-option:nth-child(1)');
        firstOption.click();
        fixture.detectChanges();
        expect(valueChanged).toBe(options[0]);

        // Emulate second option select
        component.trigger.openPanel();
        component.value = 'targ';
        fixture.detectChanges();
        const secondOption: HTMLElement = overlayContainerElement.querySelector('mat-option:nth-child(2)');
        secondOption.click();
        fixture.detectChanges();
        expect(valueChanged).toBe(options[1]);
      });
    });
  });
});
