import {
  ChangeDetectionStrategy,
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
import { CHAR_FORBIDDEN_PATTERN, SPECIAL_CHAR_FORBIDDEN_PATTERN } from "../../../../misc/constants";

@Component({
  selector: 'peb-edit-taxes',
  templateUrl: './edit-taxes.component.html',
  styleUrls: ['./edit-taxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditTaxesComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public taxesForm: FormGroup = this.formBuilder.group({
    companyRegisterNumber: ['', Validators.pattern(SPECIAL_CHAR_FORBIDDEN_PATTERN)],
    taxId: ['', Validators.pattern(CHAR_FORBIDDEN_PATTERN)],
    taxNumber: ['', Validators.pattern(CHAR_FORBIDDEN_PATTERN)],
    turnoverTaxAct: [false],
  });
  private data: any;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    if (this.overlayData.data.business) {
      this.data = this.overlayData.data.business;
    }
    this.setOriginForm();
    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onSave(): void {
    if (this.taxesForm.valid) {
      this.data['taxes'] = this.taxesForm.value;
      this.peOverlayRef.close({ data: this.data });
    }
  }

  private setOriginForm(): void {
    const formData = this.overlayData.data.business?.taxes || {};
    this.taxesForm.patchValue(formData);
  }
}
