import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { AbstractComponentDirective } from '../../../misc/abstract.component';
import { PeOverlayRef, PE_OVERLAY_DATA, PE_OVERLAY_SAVE, OverlayHeaderConfig, PE_OVERLAY_CONFIG } from '@pe/overlay-widget';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { skip } from 'rxjs/operators';
import { PeDateTimePickerService } from '@pe/ui';
import * as moment from 'moment';
import { MatIconRegistry } from '@angular/material/icon';
@Component({
  selector: 'peb-new-program-dialog',
  templateUrl: './new-program.component.html',
  styleUrls: ['./new-program.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PebNewProgramComponent extends AbstractComponentDirective implements OnInit {
  edit = false;
  theme;
  @Output()
  loadingStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  loading = false;
  newProgramForm: FormGroup = this.formBuilder.group({
    programName: [''],
    programApiId: [''],
    startedDate: [''],
  });
  startedDate = '';

  products = [
    { label: 'Product 1', image: 'https://picsum.photos/32', value: { name: 'Product1', value: 'cat1' } },
    { label: 'Product 2', image: 'https://picsum.photos/32', value: { name: 'Product2', value: 'cat2' } },
    { label: 'Product 3', image: 'https://picsum.photos/32', value: { name: 'Product3', value: 'cat3' } },
    { label: 'Product 4', image: 'https://picsum.photos/32', value: { name: 'Product4', value: 'cat4' } },
    { label: 'Product 5', image: 'https://picsum.photos/32', value: { name: 'Product5', value: 'cat5' } },
    { label: 'Product 6', image: 'https://picsum.photos/32', value: { name: 'Product6', value: 'cat6' } },
    { label: 'Product 7', image: 'https://picsum.photos/32', value: { name: 'Product7', value: 'cat7' } },
    { label: 'Product 8', image: 'https://picsum.photos/32', value: { name: 'Product8', value: 'cat8' } },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private dateTimePicker: PeDateTimePickerService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
    this.matIconRegistry.addSvgIcon(
      `datetime-picker`,
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/datetime-picker-icon.svg'),
    );

  }

  ngOnInit() {
    this.theme = this.overlayConfig.theme;
    this.overlaySaveSubject.pipe(skip(1)).subscribe(() => {
      this.onCheckValidity();
    });
  }

  onCheckValidity() {
    const value = this.newProgramForm.controls;
    // const numberRegEx = /\-?\d*\.?\d{1,2}/;

    // value.budget.setValidators([Validators.required, Validators.pattern(numberRegEx), Validators.min(1)]);
    // value.budget.updateValueAndValidity();

    // value.fromAge.setValidators([Validators.required, Validators.pattern(numberRegEx), Validators.min(18), Validators.max(64)]);
    // value.fromAge.updateValueAndValidity();

    // value.toAge.setValidators([Validators.required, Validators.pattern(numberRegEx), Validators.min(65), Validators.max(100)]);
    // value.toAge.updateValueAndValidity();

    value.programName.setValidators([Validators.required, Validators.minLength(10)]);
    value.programName.updateValueAndValidity();

    value.programApiId.setValidators([Validators.required, Validators.minLength(5)]);
    value.programApiId.updateValueAndValidity();

    this.cdr.detectChanges();
    if (this.newProgramForm.valid){
      this.onSave();
    }
  }
  onSave(){
    console.log('saved successfully');
  }

  onClose() {
    this.peOverlayRef.close();
  }
  onOpenDatepicker(event) {
    const dialogRef = this.dateTimePicker.open(event, { theme: 'dark' });
    dialogRef.afterClosed.subscribe((date) => {
      const datePicked = moment(date).format('DD.MM.YYYY');
      console.log('datePickerd', datePicked);
      this.startedDate = datePicked;
    });
  }
}
