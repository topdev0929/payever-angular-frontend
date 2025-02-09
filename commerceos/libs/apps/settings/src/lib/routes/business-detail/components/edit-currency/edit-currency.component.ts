import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { BusinessEnvService } from '../../../../services';


@Component({
  selector: 'peb-edit-currency',
  templateUrl: './edit-currency.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditCurrencyComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public currencies = [];
  public selectedCurrency: {label: string, value: string};
  public currencyForm: FormGroup = this.formBuilder.group({
    currency: [this.currencies, [Validators.required]],
  });
  private data: any;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private businessEnvService: BusinessEnvService,
    private readonly destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.currencies = this.overlayData.data.currencies.map((res) => {
      return { label: `${res.name}, ${res.code}`, value: res.code };
    });

    if (this.overlayData.data.currencies) {
      this.data = this.overlayData.data.business;
      this.currencyForm.get('currency').setValue(this.data.currency);
      this.selectedCurrency = {
        label: `${this.overlayData.data.currencies.find(res => res.code === this.data.currency).name}, ${this.data.currency}`,
        value: this.data.currency,
      };
      this.cdr.detectChanges();
    }

    this.currencyForm.get('currency').valueChanges.subscribe((res) => {
      if (res !== this.data.currency) {
        this.data.currency = res;
      }
    });

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onSave() {
    if (this.currencyForm.valid) {
      this.data['businessDetail'] = this.overlayData.data.details;
      if (this.data.businessDetail?.currency) {
        this.data.businessDetail.currency = this.data.currency;
      }
      this.businessEnvService.businessData = this.data;
      this.peOverlayRef.close({ data: this.data });
    }
  }
}

