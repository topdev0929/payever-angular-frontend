import {
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { assign, cloneDeep } from 'lodash-es';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
import { flatMap, map, shareReplay, takeUntil, tap } from 'rxjs/operators';

import { PebColorPickerService } from '@pe/builder/color-picker';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import {
  PE_OVERLAY_DATA,
  PeOverlayRef,
  PE_OVERLAY_CONFIG,
} from '@pe/overlay-widget';

import {
  CheckoutInterface,
  CheckoutSettingsInterface,
  ColorAndStylePanelInterface,
  StylesSettingsInterface,
} from '../../../interfaces';
import { colorAndStyleMenu } from '../../../panels-info-data';
import { RootCheckoutWrapperService, StorageService } from '../../../services';
import { BaseSettingsComponent } from '../base-settings.component';

import { HEADER_STYLES_SCHEME, LOGO_STYLES_SCHEME } from './components';
import { DEFAULT_STYLES } from './constants';
import { ScreenTypeEnum } from './enums';
import { ScreenTypeStylesService } from './services/screen-type.service';
import { GetFormSchemeControlNames } from './utils';


@Component({
  selector: 'checkout-color-and-style',
  templateUrl: './color-and-style.component.html',
  styleUrls: ['color-and-style.component.scss'],
  providers: [PebColorPickerService, ScreenTypeStylesService, PeDestroyService],
})
export class ColorAndStyleComponent extends BaseSettingsComponent implements OnInit, OnDestroy {

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
  onSave$ = this.overlayData.onSave$.pipe(takeUntil(this.destroy$));
  onClose$ = this.overlayData.onClose$.pipe(takeUntil(this.destroy$));
  checkoutUuid = this.overlayData.checkoutUuid;

  showPanelIndex = 0;

  onSuccessSubject$ = new BehaviorSubject<number>(0);
  onCancelSubject$ = new BehaviorSubject<number>(0);
  screenSelect$: Observable<string>;

  readonly defaultStyles: StylesSettingsInterface = DEFAULT_STYLES;

  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public translateService: TranslateService,
    private wrapperService: RootCheckoutWrapperService,
    private storageService: StorageService,
    private confirmScreenService: ConfirmScreenService,
    private screenTypeStylesService: ScreenTypeStylesService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any
  ) {
    super(injector);
    this.screenSelect$ = this.screenTypeStylesService.screen$.pipe(
      map((screen: ScreenTypeEnum) => this.translateService.translate(`settings.colorAndStyle.screen.values.${screen}`))
    );
  }

  ngOnInit() {
    super.ngOnInit();
    this.overlayConfig.isLoading$ = this.isLoading$.asObservable();
    this.overlayConfig.doneBtnCallback = () => {
      this.saveChanges();
    };

    this.channelSetId$ = this.wrapperService.getCheckoutChannelSetID(this.checkoutUuid).pipe(shareReplay());
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentCheckout: CheckoutInterface) => {
        this.currentCheckout = currentCheckout;
        const s = this.currentCheckout.settings;
        this.stylesSettings = assign(cloneDeep(this.defaultStyles), s?.styles ? s?.styles : {});
        this.initStyleForm();
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
    this.wrapperService.reCreateFlow(); // Just resetting inputted data
  }

  trackByFn(i: number, section: ColorAndStylePanelInterface): string {
    return section.key;
  }

  onChangeDevice(): void {
    this.screenTypeStylesService.openDialog();
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
    const controlsFactory = (controls: string[]) => controls.reduce((acc: { [key: string]: any }, controlName) => ({
      ...acc,
      [controlName]: this.stylesSettings[controlName],
    }), {});

    const headerControls = GetFormSchemeControlNames(HEADER_STYLES_SCHEME);
    const logoControls = GetFormSchemeControlNames(LOGO_STYLES_SCHEME);

    this.formStyle = this.fb.group({
      ...controlsFactory(headerControls),
      ...controlsFactory(logoControls),

      buttonBackgroundColor: this.stylesSettings.buttonBackgroundColor,
      buttonBackgroundDisabledColor: this.stylesSettings.buttonBackgroundDisabledColor,
      buttonTextColor: this.stylesSettings.buttonTextColor,
      buttonBorderRadius: this.stylesSettings.buttonBorderRadius,

      buttonSecondaryBackgroundColor: this.stylesSettings.buttonSecondaryBackgroundColor,
      buttonSecondaryBackgroundDisabledColor: this.stylesSettings.buttonSecondaryBackgroundDisabledColor,
      buttonSecondaryTextColor: this.stylesSettings.buttonSecondaryTextColor,
      buttonSecondaryBorderRadius: this.stylesSettings.buttonSecondaryBorderRadius,

      pageBackgroundColor: this.stylesSettings.pageBackgroundColor,
      pageLineColor: this.stylesSettings.pageLineColor,
      pageTextPrimaryColor: this.stylesSettings.pageTextPrimaryColor,
      pageTextSecondaryColor: this.stylesSettings.pageTextSecondaryColor,
      pageTextLinkColor: this.stylesSettings.pageTextLinkColor,

      inputBackgroundColor: this.stylesSettings.inputBackgroundColor,
      inputBorderColor: this.stylesSettings.inputBorderColor,
      inputTextPrimaryColor: this.stylesSettings.inputTextPrimaryColor,
      inputTextSecondaryColor: this.stylesSettings.inputTextSecondaryColor,
      inputBorderRadius: this.stylesSettings.inputBorderRadius,

      active: this.stylesSettings.active,
    });


    const businessLogoHeightCtrlNames = logoControls.filter(name => /businessLogo.+Height/.test(name));
    this.formStyle.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.stylesChanged = true;

      businessLogoHeightCtrlNames.forEach((controlName: string) => {
        const control = this.formStyle.get(controlName);
        const dimension = controlName.replace(/businessLogo(.+)Height/, (_, g) => g);
        const headerHeight = this.formStyle.get(`${'businessHeader'}${dimension}Height`)?.value;
        const [controlValue, unit] = this.splitSizeAndUnit(control.value);
        const [headerHeightValue, headerHeightUnit] = this.splitSizeAndUnit(headerHeight);

        if (unit === headerHeightUnit) {
          control.setValue(
            `${Math.min(controlValue, headerHeightValue)}${unit}`,
            { onlySelf: true }
          );
        }
      });
    });

    this.changeDetectorRef.detectChanges();
  }

  private splitSizeAndUnit(value: string): [number, string] {
    const [, size, unit] = value?.split(/(\d+)/) || [];

    return [Number(size) || 0, unit];
  };

  private saveChanges(): void {

    const values: StylesSettingsInterface = this.formStyle.value;
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
      this.overlayData.close();
    }, (err) => {
      this.showError(err.message || 'Not possible to save styles! Unknown error!');
      this.isLoading$.next(false);
    });
  }

  updateCheckoutSettings(): void {
    this.wrapperService.onSettingsUpdated();
  }

  openPanel(panelIndex: number) {
    this.showPanelIndex = panelIndex;
  }

  openColorPickerPanel(id: string): void {
    const elementRef = document.querySelector(`button[pe-qa-color-picker='${id}']`) as HTMLButtonElement;
    elementRef?.click();
  }

  private initWarningModal() {
    const headings: Headings = {
      title: this.translateService.translate('warning-modal.title'),
      subtitle: this.translateService.translate('warning-modal.description'),
      confirmBtnText: this.translateService.translate('warning-modal.actions.yes'),
      declineBtnText: this.translateService.translate('warning-modal.actions.no'),
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          this.overlayData.close();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }
}
