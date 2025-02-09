import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SessionStorageService } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { TranslateService, TranslationTemplateArgs } from '@pe/i18n';

import { ProductEditorSections } from '../../../enums';
import { ExternalError, InventorySection, VariantsSection } from '../../../interfaces';
import { SectionsService } from '../../../services/sections.service';
import { EditorInventorySectionComponent } from './editor-inventory-section.component';

describe('EditorInventorySectionComponent', () => {
  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;
  let sessionStorageMock: SessionStorageService;

  beforeEach(() => {
    translateServiceMock = {
      translate: (key: string, args?: TranslationTemplateArgs) => 'translation',
    } as any;
    sectionsServiceMock = {
      removeVariant: () => true,
      onFindError: (haveErrors: boolean, section: ProductEditorSections) => { return; },
      onChangeInventorySection: (inventorySection: InventorySection) => { return; },
      saveClicked$: new Subject<ProductEditorSections | string>(),
      variantsChange$: new Subject<VariantsSection[]>(),
      variantsSection: [],
      inventorySection: {
        sku: 'sku',
        barcode: 'barcode',
        inventory: 10,
        inventoryTrackingEnabled: false,
      },
    } as any;
    sessionStorageMock = {
      store: () => { return; },
      retrieve: () => ({}),
    } as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditorInventorySectionComponent],
      providers: [
        EditorInventorySectionComponent,
        { provide: Injector, useValue: null },
        { provide: ErrorBag, useClass: ErrorBag },
        { provide: TranslateService, useFactory: () => translateServiceMock },
        { provide: SectionsService, useFactory: () => sectionsServiceMock },
        { provide: FormBuilder, useClass: FormBuilder },
        { provide: SessionStorageService, useFactory: () => sessionStorageMock },
      ],
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
      ],
    }).compileComponents();
  });

  it('should be defined', () => {
    const fixture: ComponentFixture<EditorInventorySectionComponent> = TestBed.createComponent(EditorInventorySectionComponent);
    const component: EditorInventorySectionComponent = fixture.componentInstance;
    expect(component).toBeDefined();
  });

  it('should be initialized', () => {
    const fixture: ComponentFixture<EditorInventorySectionComponent> = TestBed.createComponent(EditorInventorySectionComponent);
    const component: EditorInventorySectionComponent = fixture.componentInstance;

    component.externalError = new Subject<ExternalError>();
    spyOn(component, 'ngAfterViewInit');

    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  function getComponent(): EditorInventorySectionComponent {
    const fixture: ComponentFixture<EditorInventorySectionComponent> = TestBed.createComponent(EditorInventorySectionComponent);
    const component: EditorInventorySectionComponent = fixture.componentInstance;

    component.externalError = new Subject<ExternalError>();
    spyOn(component, 'ngAfterViewInit');

    fixture.detectChanges();
    return component;
  }

  it('#createForm should instantiate formSheme and toggleControls', () => {
    const component: any = getComponent();

    const toggleControlsSpy: jasmine.Spy = spyOn(component, 'toggleControls');
    const detectChangesSpy: jasmine.Spy = spyOn(component.changeDetectorRef, 'detectChanges');

    component.createForm(sectionsServiceMock.inventorySection);
    expect(component.form).toBeDefined();
    expect(component.formScheme).toBeDefined();

    expect(toggleControlsSpy).toHaveBeenCalled();
    expect(detectChangesSpy).toHaveBeenCalled();
  });

  function getInitializedComponent(): EditorInventorySectionComponent {
    const fixture: ComponentFixture<EditorInventorySectionComponent> = TestBed.createComponent(EditorInventorySectionComponent);
    const component: EditorInventorySectionComponent = fixture.componentInstance;

    component.externalError = new Subject<ExternalError>();
    spyOn((component as any).changeDetectorRef, 'detectChanges'); // need to stub it as there are issues with injection of changeDetector
    fixture.detectChanges();

    return component;
  }

  it('#onUpdateFormData should call sectionsService.onChangeInventorySection', () => {
    const component: any = getInitializedComponent();
    const onChangeInventorySectionSpy: jasmine.Spy = spyOn(sectionsServiceMock, 'onChangeInventorySection');

    const expectedParams: InventorySection = component.form.getRawValue();
    component.onUpdateFormData({ } as InventorySection); // method paramether is not used in current implementation at the momemnt
    expect(onChangeInventorySectionSpy).toHaveBeenCalledWith(expectedParams);
  });

  it('#onSuccess should call sectionsService.onFindError to switch errors off', () => {
    const component: any = getInitializedComponent();
    const onFindErrorSpy: jasmine.Spy = spyOn(sectionsServiceMock, 'onFindError');

    const expectedParams: any = [false, component.section];

    component.onSuccess();
    expect(onFindErrorSpy).toHaveBeenCalledWith(...expectedParams);
  });

  it('#onFormInvalid should call sectionsService.onFindError to turn errors on', () => {
    const component: any = getInitializedComponent();
    const onFindErrorSpy: jasmine.Spy = spyOn(sectionsServiceMock, 'onFindError');
    const expectedParams: any = [true, component.section];

    component.onFormInvalid();
    expect(onFindErrorSpy).toHaveBeenCalledWith(...expectedParams);
  });

  it('#toggleControls should enable `inventory` controls if there are no variants', () => {
    const component: any = getInitializedComponent();
    const enableControlSpy: jasmine.Spy = spyOn(component, 'enableControl');

    expect(sectionsServiceMock.variantsSection.length).toBe(0);
    component.toggleControls();
    expect(enableControlSpy).toHaveBeenCalledWith('inventoryTrackingEnabled');
    expect(enableControlSpy).toHaveBeenCalledWith('inventory');
  });

  it('#toggleControls should disable `inventory` controls if there is at least 1 variant', () => {
    const component: any = getInitializedComponent();
    const disableControlSpy: jasmine.Spy = spyOn(component, 'disableControl');
    const onChangeInventorySectionSpy: jasmine.Spy = spyOn(sectionsServiceMock, 'onChangeInventorySection');

    sectionsServiceMock.variantsSection.push({
      id: 'id', barcode: 'bar', description: 'descr',
    } as VariantsSection);
    expect(sectionsServiceMock.variantsSection.length).toBeGreaterThan(0);
    component.toggleControls();
    expect(disableControlSpy).toHaveBeenCalledWith('inventoryTrackingEnabled');
    expect(disableControlSpy).toHaveBeenCalledWith('inventory');
    expect(onChangeInventorySectionSpy).toHaveBeenCalledWith({
        ...component.form.getRawValue(),
        inventoryTrackingEnabled: false,
        inventory: 0,
        sku: null,
    });
  });

  it('should submit on saveClicked$', () => {
    const component: any = getInitializedComponent();
    const doSubmitSpy: jasmine.Spy = spyOn(component, 'doSubmit');

    sectionsServiceMock.saveClicked$.next(ProductEditorSections.Inventory);
    expect(doSubmitSpy).toHaveBeenCalled();
  });

  it('should toggle controls on variantsChange$', () => {
    const component: any = getInitializedComponent();
    const toggleControlsSpy: jasmine.Spy = spyOn(component, 'toggleControls');

    sectionsServiceMock.variantsChange$.next([{
      id: 'id', barcode: 'bar', description: 'descr',
    } as VariantsSection]);
    expect(toggleControlsSpy).toHaveBeenCalled();
  });

  it('should set errors on externalError', () => {
    const component: EditorInventorySectionComponent = getInitializedComponent();

    const errorBagSetErrorsSpy: jasmine.Spy = spyOn((component as any).errorBag, 'setErrors');
    const sectionsServiceOnFindErrorSpy: jasmine.Spy = spyOn((component as any).sectionsService, 'onFindError');

    const errorField = 'test-field';
    const expectedErrorBagParam: any = {
      [errorField]: 'test-error',
    };

    component.externalError.next({
      section: ProductEditorSections.Inventory,
      field: errorField,
      errorText: expectedErrorBagParam[errorField],
    });
    expect(errorBagSetErrorsSpy).toHaveBeenCalledWith(expectedErrorBagParam);
    expect(sectionsServiceOnFindErrorSpy).toHaveBeenCalledWith(true, component.section);
  });
});
