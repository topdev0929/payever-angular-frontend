import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ClipboardService } from 'ngx-clipboard';

import { TranslateService } from '@pe/i18n';
import { PE_ENV } from '@pe/common';

import { FinexpModule } from '../../../finexp.module';
import { ChannelsSettingsComponent } from './channels-settings.component';
import {
  FinexpApiAbstractService,
  FinexpHeaderAbstractService,
  FinexpStorageAbstractService,
  GenerateHtmlService
} from '../../../services';
import {
  widgetId,
  checkoutUuid,
  commerceosUrl,
  widgetSettings,
  ApiServiceStub,
  HeaderServiceStub,
  StorageServiceStub,
  TranslateServiceStub,
  PayeverPaymentWidgetLoaderStub, paymentOptions, buisenessUiid
} from './mock.data';

describe('ChannelsSettingsComponent', () => {

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        FinexpModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes(
          []
        )
      ],
      providers: [
        ChannelsSettingsComponent,
        GenerateHtmlService,
        ClipboardService,
        { provide: FinexpApiAbstractService, useClass: ApiServiceStub },
        { provide: FinexpStorageAbstractService, useClass: StorageServiceStub },
        { provide: FinexpHeaderAbstractService, useClass: HeaderServiceStub },
        { provide: TranslateService, useClass: TranslateServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                checkoutUuid: checkoutUuid,
                widgetId: widgetId
              }
            }
          }
        },
        { provide: PE_ENV, useValue: { frontend: { commerceos: commerceosUrl } } }
      ],
    }).compileComponents();
  });

  it('changes should have impact on widget', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    const el = fixture.debugElement;

    fixture.detectChanges();
    component.ngOnInit();

    const widget = el.query(By.css('.payever-finexp-widget'));
    expect(widget).toBeDefined();

    expect(widget.attributes['data-channelset']).toBe('840a8864-c5fc-4b58-914d-55275c61979b');
    expect(widget.attributes['data-checkoutid']).toBe(checkoutUuid);
    expect(widget.attributes['data-widgetid']).toBe(widgetId);
    expect(widget.attributes['data-business']).toBe(buisenessUiid);
  });

  it('should be defined and initialize data', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    component['widgetLoader'] = (new PayeverPaymentWidgetLoaderStub()) as any;

    expect(component).toBeDefined();
    component.ngOnInit();

    expect(component.widgetId).toEqual(widgetId);
    expect(component.checkoutUuid).toEqual(checkoutUuid);
    expect(component.widgetConfig).toEqual(widgetSettings as any);
    expect(component.paymentsOptions).toEqual(paymentOptions as any);
    expect(component.connectedPayments.length).toEqual(2);
  });

  it('should show general settings menu and track changes', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    const el = fixture.debugElement;
    const widget = el.query(By.css('.payever-finexp-widget'));

    component.ngOnInit();

    el.query(By.css('#general-settings-button')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(el.query(By.css('#general-settings-menu')).nativeElement).toBeDefined();

    const ratesOrderControl = component.form.controls['ratesOrder'];
    const ratesAskInput = el.query(By.css('#general-settings-menu')).query(By.css('#rates-asc'));
    const ratesDescInput = el.query(By.css('#general-settings-menu')).query(By.css('#rates-desc'));

    ratesAskInput.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(ratesOrderControl.value).toBe('asc');
    expect(component.widgetConfig.ratesOrder).toBe('asc');
    expect(widget.attributes['data-ratesorder']).toBe('asc');

    ratesDescInput.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(ratesOrderControl.value).toBe('desc');
    expect(component.widgetConfig.ratesOrder).toBe('desc');
    expect(widget.attributes['data-ratesorder']).toBe('desc');

    const placementsButton = el.query(By.css('#general-settings-menu')).query(By.css('#placements'));

    placementsButton.triggerEventHandler('click', null);
    const rightSidebar = el.query(By.css('#rightSidebar'));
    rightSidebar.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.widgetConfig.checkoutPlacement).toBe('rightSidebar');
    expect(widget.attributes['data-checkoutplacement']).toBe('rightSidebar');

    expect(widget.attributes['data-amount']).toBe('385');
  });

  it('should show style settings menu and track changes', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    const el = fixture.debugElement;
    const widget = el.query(By.css('.payever-finexp-widget'));

    fixture.detectChanges();
    component.ngOnInit();

    fixture.detectChanges();
    el.query(By.css('#styles-settings-button')).triggerEventHandler('click', null);
    expect(el.query(By.css('#styles-settings-menu')).nativeElement).toBeDefined();

    const maxWidthInput = el.query(By.css('#styles-settings-menu'))
      .nativeElement.querySelector('#maxWidth')
      .querySelector('input');
    const maxWidthControl = component.form.controls['maxWidth'];

    maxWidthControl.setValue(400);
    fixture.detectChanges();
    expect(maxWidthInput.value).toBe('400');
    expect(widget.attributes['data-maxwidth']).toBe('400');

    maxWidthInput.value = 500;
    maxWidthInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(maxWidthControl.value).toBe(500);
    expect(component.widgetConfig.maxWidth).toBe(500);
    expect(widget.attributes['data-maxwidth']).toBe('500');

    const isVisibleCheckbox = el.query(By.css('#styles-settings-menu'))
      .nativeElement.querySelector('#isVisible')
      .querySelector('input');

    isVisibleCheckbox.click();
    isVisibleCheckbox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.widgetConfig.isVisible).toBe(false);
    expect(widget.attributes['data-isvisible']).toBe('false');

    isVisibleCheckbox.click();
    isVisibleCheckbox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.widgetConfig.isVisible).toBe(true);
    expect(widget.attributes['data-isvisible']).toBe('true');

    const backgroundColorButton = el.query(By.css('#styles-settings-menu'))
      .nativeElement.querySelector('#backgroundColor')
      .querySelector('.btn-colorpicker');
    const backgroundColorControl = component.form.controls['backgroundColor'];

    backgroundColorButton.click();
    fixture.detectChanges();

    backgroundColorControl.setValue('#bbbbbb');
    fixture.detectChanges();
    expect(component.widgetConfig.styles.backgroundColor).toBe('#bbbbbb');
    expect(JSON.parse(widget.attributes['data-styles']).backgroundColor).toBe('#bbbbbb');
  });

  it('should show checkout mode menu and change value correctly', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    const el = fixture.debugElement;
    const widget = el.query(By.css('.payever-finexp-widget'));

    fixture.detectChanges();
    component.ngOnInit();

    el.query(By.css('#checkout-mode-button')).triggerEventHandler('click', null);
    expect(el.query(By.css('#checkout-mode-menu')).nativeElement).toBeDefined();

    el.query(By.css('#checkout-mode-menu')).query(By.css('#calculator')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.widgetConfig.checkoutMode).toBe('calculator');
    expect(widget.attributes['data-checkoutmode']).toBe('calculator');

    el.query(By.css('#checkout-mode-menu')).query(By.css('#financeExpress')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.widgetConfig.checkoutMode).toBe('financeExpress');
    expect(widget.attributes['data-checkoutmode']).toBe('financeExpress');

    el.query(By.css('#checkout-mode-menu')).query(By.css('#none')).triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(component.widgetConfig.checkoutMode).toBe('none');
    expect(widget.attributes['data-checkoutmode']).toBe('none');
  });

  it('should show payments menu and change values correctly', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    const el = fixture.debugElement;
    const widget = el.query(By.css('.payever-finexp-widget'));

    fixture.detectChanges();
    component.ngOnInit();

    el.query(By.css('#payments-button')).triggerEventHandler('click', null);
    expect(el.query(By.css('#payments-menu')).nativeElement).toBeDefined();
    expect(el.query(By.css('#payments-menu')).query(By.css('#checkbox-santander_factoring_de'))).toBeDefined();

    const factoringCheckbox = el.query(By.css('#payments-menu'))
      .nativeElement.querySelector('#checkbox-santander_factoring_de')
      .querySelector('input');

    factoringCheckbox.click();
    factoringCheckbox.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.widgetConfig.payments.length).toBe(0);
    expect(widget.attributes['data-payments']).toBe('[]');

    const installmentCheckbox = el.query(By.css('#payments-menu'))
      .nativeElement.querySelector('#checkbox-santander_installment')
      .querySelector('input');

    installmentCheckbox.click();
    installmentCheckbox.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.widgetConfig.payments[0].paymentMethod).toBe('santander_installment');
    expect(widget.attributes['data-payments']).toBe('[{"paymentMethod":"santander_installment"}]');

    const installmentEditButton = el.query(By.css('#payments-menu')).nativeElement.querySelector('#edit-santander_installment');
    installmentEditButton.click();
    installmentEditButton.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const installmentMinLimitInput = el.query(By.css('#payments-menu'))
      .nativeElement.querySelector('#min-limit-santander_installment')
      .querySelector('input');
    const installmentMaxLimitInput = el.query(By.css('#payments-menu'))
      .nativeElement.querySelector('#max-limit-santander_installment')
      .querySelector('input');

    const installmentMinLimitControl = component.amountLimitsForm.controls['minLimit'];
    const installmentMaxLimitControl = component.amountLimitsForm.controls['maxLimit'];

    installmentMinLimitInput.value = 50;
    installmentMinLimitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(installmentMinLimitControl.valid).toBe(false);

    installmentMinLimitInput.value = 200;
    installmentMinLimitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(installmentMinLimitControl.value).toBe(200);
    expect(widget.attributes['data-amount']).toBe('50049.5');

    installmentMaxLimitInput.value = 20;
    installmentMaxLimitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(installmentMaxLimitControl.valid).toBe(false);

    installmentMaxLimitInput.value = 100000000;
    installmentMaxLimitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(installmentMaxLimitControl.valid).toBe(false);

    installmentMaxLimitInput.value = 5000;
    installmentMaxLimitInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(installmentMaxLimitControl.value).toBe(5000);
  });

  it('should resets widget settings correctly', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    const el = fixture.debugElement;

    fixture.detectChanges();
    component.ngOnInit();

    component.form.controls['isVisible'].patchValue(false);
    component.form.controls['ratesOrder'].patchValue('desc');
    component.form.controls['checkoutMode'].patchValue('calculator');
    component.form.controls['checkoutPlacement'].patchValue('top');
    component.form.controls['maxWidth'].patchValue(400);
    component.form.controls['backgroundColor'].patchValue('#ccccc1');
    component.form.controls['lineColor'].patchValue('#ccccc2');
    component.form.controls['mainTextColor'].patchValue('#ccccc3');
    component.form.controls['regularTextColor'].patchValue('#ccccc4');
    component.form.controls['ctaTextColor'].patchValue('#ccccd4');
    component.form.controls['buttonColor'].patchValue('#ccccc5');
    component.form.controls['fieldBackgroundColor'].patchValue('#ccccc6');
    component.form.controls['fieldLineColor'].patchValue('#ccccc7');
    component.form.controls['fieldArrowColor'].patchValue('#ccccb7');
    component.form.controls['headerTextColor'].patchValue('#ccccc8');
    fixture.detectChanges();

    expect(component.widgetConfig.isVisible).toBe(false);
    expect(component.widgetConfig.ratesOrder).toBe('desc');
    expect(component.widgetConfig.checkoutMode).toBe('calculator');
    expect(component.widgetConfig.checkoutPlacement).toBe('top');
    expect(component.widgetConfig.maxWidth).toBe(400);
    expect(component.widgetConfig.styles.backgroundColor).toBe('#ccccc1');
    expect(component.widgetConfig.styles.lineColor).toBe('#ccccc2');
    expect(component.widgetConfig.styles.mainTextColor).toBe('#ccccc3');
    expect(component.widgetConfig.styles.regularTextColor).toBe('#ccccc4');
    expect(component.widgetConfig.styles.ctaTextColor).toBe('#ccccd4');
    expect(component.widgetConfig.styles.buttonColor).toBe('#ccccc5');
    expect(component.widgetConfig.styles.fieldBackgroundColor).toBe('#ccccc6');
    expect(component.widgetConfig.styles.fieldLineColor).toBe('#ccccc7');
    expect(component.widgetConfig.styles.fieldArrowColor).toBe('#ccccb7');
    expect(component.widgetConfig.styles.headerTextColor).toBe('#ccccc8');

    component.resetWidgetSettings();
    fixture.detectChanges();

    expect(component.widgetConfig.isVisible).toBe(true);
    expect(component.widgetConfig.ratesOrder).toBe('asc');
    expect(component.widgetConfig.checkoutMode).toBe('none');
    expect(component.widgetConfig.checkoutPlacement).toBe('rightSidebar');
    expect(component.widgetConfig.maxWidth).toBe(500);
    expect(component.widgetConfig.styles.backgroundColor).toBe('#ffffff');
    expect(component.widgetConfig.styles.lineColor).toBe('#eeeeee');
    expect(component.widgetConfig.styles.mainTextColor).toBe('#333333');
    expect(component.widgetConfig.styles.regularTextColor).toBe('#333333');
    expect(component.widgetConfig.styles.ctaTextColor).toBe('#333333');
    expect(component.widgetConfig.styles.buttonColor).toBe('#e8e8e8');
    expect(component.widgetConfig.styles.fieldBackgroundColor).toBe('#ffffff');
    expect(component.widgetConfig.styles.fieldLineColor).toBe('#e8e8e8');
    expect(component.widgetConfig.styles.fieldArrowColor).toBe('#e8e8e8');
    expect(component.widgetConfig.styles.headerTextColor).toBe('#888888');
  });

  it('should change background color', () => {
    const fixture = TestBed.createComponent(ChannelsSettingsComponent);
    const component = fixture.componentInstance;
    component['widgetLoader'] = (new PayeverPaymentWidgetLoaderStub()) as any;
    const el = fixture.debugElement;

    fixture.detectChanges();
    component.ngOnInit();

    el.query(By.css('#page-background-color')).triggerEventHandler('click', null);
    fixture.detectChanges();
    component.backgroundColorControl.setValue('rgb(0, 0, 0)');
    fixture.detectChanges();

    expect(el.query(By.css('.channel-settings')).styles.backgroundColor).toBe('rgb(0, 0, 0)');
  });
});
