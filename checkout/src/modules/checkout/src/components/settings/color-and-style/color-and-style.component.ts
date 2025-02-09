import { ChangeDetectorRef, Component, Inject, Injector, OnInit, QueryList, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';

import { assign, cloneDeep, forEach } from 'lodash-es';
import { BehaviorSubject, Observable, Subject, Subscription, timer } from 'rxjs';
import { filter, flatMap, shareReplay, takeUntil } from 'rxjs/operators';
import { ColorPickerService } from 'ngx-color-picker';

import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA, PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PebColorPickerService } from '@pe/builder-color-picker';

import { colorAndStyleMenu } from '../../../panels-info-data';
import { TimestampEvent } from '../../timestamp-event';
import { RootCheckoutWrapperService, StorageService } from '../../../services';
import { CheckoutInterface, CheckoutSettingsInterface, ColorAndStylePanelInterface, StylesSettingsInterface } from '../../../interfaces';
import { BaseSettingsComponent } from '../base-settings.component';
import { CheckoutModule } from '../../../checkout.module';
import { WarningModalComponent } from '../warning-modal/warning-modal.component';

@Component({
  selector: 'checkout-color-and-style',
  templateUrl: './color-and-style.component.html',
  styleUrls: ['color-and-style.component.scss'],
  providers: [PebColorPickerService],
  encapsulation: ViewEncapsulation.None
})
export class ColorAndStyleComponent extends BaseSettingsComponent implements OnInit {

  @ViewChildren(MatExpansionPanel) panels: QueryList<MatExpansionPanel>;

  currentCheckout: CheckoutInterface;
  businessUuid: string;
  colorAndStyleMenu: ColorAndStylePanelInterface[] = colorAndStyleMenu;
  formStyle: FormGroup;
  stylesSettings: StylesSettingsInterface;
  stylesChanged: boolean;

  channelSetId$: Observable<string> = null;
  savingSub: Subscription = null;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isShowDemo$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  dialogRef: PeOverlayRef;
  theme = this.overlayData.theme;
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroyed$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroyed$));
  checkoutUuid = this.overlayData.checkoutUuid;
  updateSettings$: Subject<TimestampEvent> = new Subject();

  showPanelIndex = 0;

  onSuccessSubject$ = new BehaviorSubject<number>(0);
  onCancelSubject$ = new BehaviorSubject<number>(0);

  readonly corners = ['4px', '12px', '0px'];
  readonly cornersIcons = {
    '4px': '#icon-fe-corner-round-32',
    '12px': '#icon-fe-corner-circle-32',
    '0px': '#icon-fe-corner-square-32'
  };
  readonly defaultStyles: StylesSettingsInterface = {
    businessHeaderBackgroundColor: '#fff',
    businessHeaderBorderColor: '#dfdfdf',
    businessHeaderDesktopHeight: 55,
    businessHeaderMobileHeight: 55,

    buttonBackgroundColor: '#333333',
    buttonBackgroundDisabledColor: '#656565',
    buttonTextColor: '#ffffff',
    buttonBorderRadius: this.corners[0],

    pageBackgroundColor: '#f7f7f7',
    pageLineColor: '#dfdfdf',
    pageTextPrimaryColor: '#777777',
    pageTextSecondaryColor: '#8e8e8e',
    pageTextLinkColor: '#444444',

    inputBackgroundColor: '#ffffff',
    inputBorderColor: '#dfdfdf',
    inputTextPrimaryColor: '#3a3a3a',
    inputTextSecondaryColor: '#999999',
    inputBorderRadius: this.corners[0],
  };

  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public translateService: TranslateService,
    private wrapperService: RootCheckoutWrapperService,
    private storageService: StorageService,
    private overlayService: PeOverlayWidgetService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any
  ) {
    super(injector);
  }

  ngOnInit() {
    super.ngOnInit();

    this.channelSetId$ = this.wrapperService.getCheckoutChannelSetID(this.checkoutUuid).pipe(shareReplay());
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((currentCheckout: CheckoutInterface) => {
        this.currentCheckout = currentCheckout;
        const s = this.currentCheckout.settings;
        this.stylesSettings = assign(cloneDeep(this.defaultStyles), s && s.styles ? s && s.styles : {});
        this.initStyleForm();
      });

    this.onSave$.subscribe(() => {
      if (this.businessUuid) {
        this.saveChanges();
        this.overlayData.close();
      }
    });

    this.onClose$.subscribe(() => {
      if (this.businessUuid) {
        if (this.stylesChanged) {
          this.initWarningModal();
        } else {
          this.overlayData.close();
        }
      }
    });

    this.businessUuid = this.storageService.businessUuid;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
  }

  get selectedButtonBorderRadius(): string {
    return this.formStyle.controls['formButton'].get('buttonBorderRadius').value;
  }

  get selectedInputBorderRadius(): string {
    return this.formStyle.controls['formInput'].get('inputBorderRadius').value;
  }

  setSelectedButtonBorderRadius(br: string): void {
    this.formStyle.controls['formButton'].get('buttonBorderRadius').setValue(br);
  }

  setSelectedInputBorderRadius(br: string): void {
    this.formStyle.controls['formInput'].get('inputBorderRadius').setValue(br);
  }

  goBack(): void {
    if (this.isLoading$.getValue()) {
      this.showError('Please wait when saving is finished');
      return;
    }
    this.wrapperService.onSettingsUpdated();
    if (this.isModal) {
      this.backToModal();
    } else {
      this.router.navigate([`${this.storageService.getHomeSettingsUrl(this.checkoutUuid)}`]);
    }
  }

  resetStyles(): void {
    const isActive = this.stylesSettings.active;
    this.stylesSettings = this.defaultStyles;
    this.stylesSettings.active = isActive;
    this.initStyleForm();
    this.stylesChanged = true;
  }

  private initStyleForm(): void {
    this.formStyle = this.fb.group({
      formBusinessHeader: this.fb.group({
        businessHeaderBorderColor: this.stylesSettings.businessHeaderBorderColor,
        businessHeaderBackgroundColor: this.stylesSettings.businessHeaderBackgroundColor,
        businessHeaderDesktopHeight: this.stylesSettings.businessHeaderDesktopHeight,
        businessHeaderMobileHeight: this.stylesSettings.businessHeaderMobileHeight
      }),
      formButton: this.fb.group({
        buttonBackgroundColor: this.stylesSettings.buttonBackgroundColor,
        buttonBackgroundDisabledColor: this.stylesSettings.buttonBackgroundDisabledColor,
        buttonTextColor: this.stylesSettings.buttonTextColor,
        buttonBorderRadius: this.stylesSettings.buttonBorderRadius,
      }),
      formPage: this.fb.group({
        pageBackgroundColor: this.stylesSettings.pageBackgroundColor,
        pageLineColor: this.stylesSettings.pageLineColor,
        pageTextPrimaryColor: this.stylesSettings.pageTextPrimaryColor,
        pageTextSecondaryColor: this.stylesSettings.pageTextSecondaryColor,
        pageTextLinkColor: this.stylesSettings.pageTextLinkColor,
      }),
      formInput: this.fb.group({
        inputBackgroundColor: this.stylesSettings.inputBackgroundColor,
        inputBorderColor: this.stylesSettings.inputBorderColor,
        inputTextPrimaryColor: this.stylesSettings.inputTextPrimaryColor,
        inputTextSecondaryColor: this.stylesSettings.inputTextSecondaryColor,
        inputBorderRadius: this.stylesSettings.inputBorderRadius,
      }),
      formActive: this.fb.group({
        active: this.stylesSettings.active
      })
    });

    this.formStyle.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(data => {
      const bdh = parseInt(data.formBusinessHeader.businessHeaderDesktopHeight, 10);
      const bmh = parseInt(data.formBusinessHeader.businessHeaderMobileHeight, 10);
      if (bdh < 0) {
        this.formStyle.controls['formBusinessHeader'].get('businessHeaderDesktopHeight').setValue(0);
      } else if (bdh > 200) {
        this.formStyle.controls['formBusinessHeader'].get('businessHeaderDesktopHeight').setValue(200);
      } else if (bmh < 0) {
        this.formStyle.controls['formBusinessHeader'].get('businessHeaderMobileHeight').setValue(0);
      } else if (bmh > 200) {
        this.formStyle.controls['formBusinessHeader'].get('businessHeaderMobileHeight').setValue(200);
      }
      this.stylesChanged = true;
    });

    this.changeDetectorRef.detectChanges();
  }

  private saveChanges(): void {

    const values: StylesSettingsInterface = {};
    forEach(this.formStyle.value, v => assign(values, v));
    const newSettings: CheckoutSettingsInterface = cloneDeep(this.currentCheckout.settings);
    if (!newSettings.styles) {
      newSettings.styles = {};
    }
    assign(newSettings.styles, values);

    if (this.savingSub) {
      this.savingSub.unsubscribe();
    }
    this.isLoading$.next(true);
    this.savingSub = timer(600).pipe(
      flatMap(() => this.storageService.saveCheckoutSettings(this.currentCheckout._id, newSettings))
    ).subscribe(() => {
      this.isLoading$.next(false);
      this.updateCheckoutSettings();
    }, err => {
      this.showError(err.message || 'Not possible to save styles! Unknown error!');
      this.isLoading$.next(false);
    });
  }

  updateCheckoutSettings(): void {
    this.updateSettings$.next(new TimestampEvent());
  }

  openPanel(panelIndex: number) {
    this.showPanelIndex = panelIndex;
  }

  openColorPickerPanel(id: string): void {
    const elementRef = document.querySelector(`button[pe-qa-color-picker='${id}']`) as HTMLButtonElement;
    elementRef?.click();
  }

  private initWarningModal() {
    this.onSuccessSubject$ = new BehaviorSubject<number>(0);
    this.onCancelSubject$ = new BehaviorSubject<number>(0);
    const config: PeOverlayConfig = {
      data: {
        onSuccess: this.onSuccessSubject$,
        onCancel: this.onCancelSubject$,
      },
      hasBackdrop: true,
      backdropClass: 'settings-modal',
      backdropClick: () => null,
      headerConfig: {
        title: '',
        theme: this.theme,
        hideHeader: true
      },
      component: WarningModalComponent,
      lazyLoadedModule: CheckoutModule
    };

    this.onSuccessSubject$.asObservable().pipe(takeUntil(this.destroyed$), filter(d => !!d))
      .subscribe(() => {
        this.overlayService.close();
        this.overlayData.close();
      });
    this.onCancelSubject$.asObservable().pipe(takeUntil(this.destroyed$), filter(d => !!d))
      .subscribe(() => {
        this.overlayService.close();
      });

    this.dialogRef = this.overlayService.open(config);
  }
}
