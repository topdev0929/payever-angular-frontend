import { ElementRef, Injector, ViewChild, Directive, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { Observable, of, throwError } from 'rxjs';
import { catchError, debounceTime, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PePlatformHeaderItem } from '@pe/platform-header';

import {
  WidgetType,
  SettingsResponseInterface,
  BaseWidgetSettingsInterface,
  CheckoutChannelSetInterface,
  widgetCreatedEventMessage,
  swedenTokenErrorEventMessage,
  paymentOptionsNotSetEventMessage,
  cannotGetCalculationsEventMessage,
} from '../../interfaces';
import {
  GenerateHtmlService,
  FinexpHeaderAbstractService,
  FinexpApiAbstractService,
  FinexpStorageAbstractService,
} from '../../services';
import { AbstractComponent } from '../abstract.component';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export abstract class AbstractWidgetSettingsComponent
  extends AbstractComponent
  implements OnInit, OnDestroy {

  @ViewChild('preview', { static: true }) previewElement: ElementRef;

  allowSettingsManualScroll = true;
  channelSetId: string;
  errorMessage: string;
  form: FormGroup;
  generatedHtml: string;
  isGeneratedCode: boolean;
  isCalculatorOverlay: boolean;
  isCheckoutOverlay: boolean;
  isVisibility: boolean;
  showSpinner = false;
  noConnections = false;

  protected activatedRoute: ActivatedRoute = this.injector.get(ActivatedRoute);
  protected apiService: FinexpApiAbstractService = this.injector.get(FinexpApiAbstractService);
  protected cdr: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  protected formBuilder: FormBuilder = this.injector.get(FormBuilder);
  protected router: Router = this.injector.get(Router);
  protected storageService: FinexpStorageAbstractService = this.injector.get(FinexpStorageAbstractService);
  protected generateHtmlService: GenerateHtmlService = this.injector.get(GenerateHtmlService);
  protected _clipboardService: ClipboardService = this.injector.get(ClipboardService);

  protected abstract channelSetType: WidgetType;

  protected readonly saveRequestDebounceTime: number = 500;
  protected readonly spinnerDiameter: number = 26;
  protected readonly spinnerWidth: number = 2;

  protected headerService: FinexpHeaderAbstractService = this.injector.get(FinexpHeaderAbstractService);

  constructor(protected injector: Injector) {
    super();
  }

  get checkoutUuid(): string {
    return this.activatedRoute.snapshot.params['checkoutUuid'] || this.activatedRoute.parent.snapshot.params['checkoutUuid'];
  }

  get isCheckoutOverlayControlValue(): boolean {
    return this.form.controls['isCheckoutOverlay'].value;
  }

  get isCalculatorOverlayControlValue(): boolean {
    return this.form.controls['isCalculatorOverlay'].value;
  }

  get financeExpressScriptElement(): HTMLScriptElement {
    return document.querySelector('script[src*="finance_express.embed.min.js"]') as HTMLScriptElement;
  }

  /**
   * <style> element with custon styles for widget
   */
  get financeExpressCustomStyleElement(): HTMLStyleElement {
    return window?.['Payever'].FinanceExpress
      ? window['Payever'].FinanceExpress.styleElement
      : null;
  }

  ngOnInit(): void {
    this.showSpinner = true;

    this.subscribeToWidgetMessages();

    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
      switchMap(() => {
        return this.apiService.getChannelSets(this.storageService.businessUuid).pipe(
          map((chanelSets: CheckoutChannelSetInterface[]) =>
            chanelSets.filter(channelSet => channelSet.checkout === this.checkoutUuid)
          )
        );
      }),
      switchMap((channelSets: CheckoutChannelSetInterface[]) => {
        if (!!channelSets && channelSets.length > 0) {
          const channelSet: CheckoutChannelSetInterface = channelSets
            .find((channel: CheckoutChannelSetInterface) => channel.type === 'finance_express');

          if ( !channelSet ) {
            return throwError('channels.errors.channel-set-not-found');
          }

          this.channelSetId = channelSet.id;

          return this.generateHtmlService.generateEmbedCode(this.channelSetType, channelSet.id, false).pipe(
            switchMap((code) => {
              this.generatedHtml = code;

              return this.apiService.getWidgetSettings(this.channelSetId, this.channelSetType);
            })
          );
        } else {
          return throwError('channels.errors.channel-set-not-found');
        }
      }),
      catchError((message: string) => {
        this.errorMessage = message;

        return of(null);
      })
    ).subscribe(
      ( response: SettingsResponseInterface) => {
        if (response) {
          const formData: BaseWidgetSettingsInterface = response;
          this.createForm(formData);
          this.noConnections = false;
          this.addWidgetToPage();
        } else {
          this.createForm(null);

          // save default settings to server after first open of settings, because user can use widget right after that
          this.saveSettings().subscribe();
          this.noConnections = true;
          this.showSpinner = false;
          this.cdr.detectChanges();
        }

      },
      (err) => {
        this.storageService.showError(err);
        this.createForm(null);
        this.noConnections = true;
        this.showSpinner = false;
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.financeExpressCustomStyleElement) {
      this.financeExpressCustomStyleElement.innerHTML = '';
    }

    window['Payever'] = null;

    if (this.financeExpressScriptElement) {
      this.financeExpressScriptElement.remove();
    }
  }

  onClickGeneratedBox(event: string) {
    if (event === 'cancel') {
      this.isGeneratedCode = false;
    } else {
      this._clipboardService.copyFromContent(this.generatedHtml);
    }
  }

  onClickButton(event: string) {
    if (event === 'generateCode') {
      this.isGeneratedCode = true;
    } else {
      this.goBack();
    }
  }

  getGenerateHtmlButton(): PePlatformHeaderItem {
    return  {
      title: 'channels.generateHtml.text',
      onClick: () => this.onClickButton('generateCode'),
    };
  }

  goBack(): void {
    this.router.navigate([this.storageService.getHomeChannelsUrl(this.checkoutUuid)]);
  }

  toggleOverlay(switcherType: 'fin_exp' | 'fin_calculator', checked: boolean): void {
    if (this.form) {
      if (switcherType === 'fin_exp') {
        this.form.controls['isCheckoutOverlay'].patchValue(checked);
        this.form.controls['isCalculatorOverlay'].patchValue(false);
      } else {
        this.form.controls['isCheckoutOverlay'].patchValue(false);
        this.form.controls['isCalculatorOverlay'].patchValue(checked);
      }
    }
  }

  saveSettings(): Observable<BaseWidgetSettingsInterface> {
    const newData: BaseWidgetSettingsInterface = this.getUpdatedSettings();

    return this.apiService.saveWidgetSettings(this.channelSetId, this.channelSetType, newData );
  }

  setFormValue(fieldName: string, value: any): void {
    this.form.controls[fieldName].patchValue(value);
  }

  /**
   * If input text field has focus then we cannot scroll settings by finger
   * @param isFocus
   */
  setInputFocus(isFocus: boolean): void {
    this.allowSettingsManualScroll = !isFocus;
  }

  private addWidgetToPage(): void {
    const scriptAlreadyLoaded = !!window['Payever'];

    // set default settings for widget. Need for case when widget has no own settings
    window['PayeverCommerceos'] = {
      defaultSettings: [{ type: this.channelSetType, data: this.getUpdatedSettings() }] as SettingsResponseInterface[],
    };

    this.generateHtmlService.createEmbedElementDiv(this.channelSetType, this.channelSetId, true).subscribe((div) => {
      this.previewElement.nativeElement.appendChild(div);
      this.previewElement.nativeElement.appendChild(
        this.generateHtmlService.createEmbedElementScript(this.channelSetType, this.channelSetId)
      );
      if (scriptAlreadyLoaded) {
        if (window['Payever'].FinanceExpress.Embed) {
          window['Payever'].FinanceExpress.Embed.fetchConfigAndRun();
        }
      }
    });
  }

  subscribeToFormUpdate(): void {
    this.initValidators();

    this.form.valueChanges.pipe(
      takeUntil(this.destroyed$),
      tap(() => {
        // Update demo widget on page
        const data: any = this.getUpdatedSettings();

        if (window?.['Payever']?.FinanceExpress?.embedInstance) {
          window['Payever'].FinanceExpress.embedInstance.setSettings([ { type: this.channelSetType, data: data } ]);
        }
      }),
      debounceTime(this.saveRequestDebounceTime)
    )
      .subscribe(() => {
        if (this.form.valid) {
          this.saveSettings().subscribe();
        }
      });

    this.form.updateValueAndValidity();
  }

  private subscribeToWidgetMessages(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      if (event.origin === location.origin && event.source === window) {
        const data: any = event.data;

        switch (data) {
          case widgetCreatedEventMessage:
            this.showSpinner = false;
            this.cdr.detectChanges();
            break;
          case paymentOptionsNotSetEventMessage:
            this.showSpinner = false;
            this.errorMessage = 'channels.errors.payment-option-not-set';
            this.cdr.detectChanges();
            break;
          case cannotGetCalculationsEventMessage:
            this.showSpinner = false;
            this.errorMessage = 'channels.errors.cannot-get-calculation';
            this.cdr.detectChanges();
            break;
          case swedenTokenErrorEventMessage:
            this.showSpinner = false;
            this.errorMessage = 'channels.errors.cannot-fetch-token-for-se';
            this.cdr.detectChanges();
            break;
        }
      }
    });
  }

  protected abstract createForm(data: BaseWidgetSettingsInterface): void;
  protected abstract getUpdatedSettings(): BaseWidgetSettingsInterface;
  protected abstract initValidators(): void;
}
