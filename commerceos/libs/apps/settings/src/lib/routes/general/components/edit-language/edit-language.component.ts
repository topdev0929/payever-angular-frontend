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
import { BehaviorSubject, of } from 'rxjs';
import { catchError, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { ApiService } from '../../../../services';

@Component({
  selector: 'peb-edit-language',
  templateUrl: './edit-language.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditLanguageComponent implements OnInit {

  @ViewChild('submitTrigger') submitTriggerRef: ElementRef<HTMLButtonElement>;

  public languages: { label: string, value: string }[] = [];
  private isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public languageForm: FormGroup = this.formBuilder.group({
    language: [this.languages, [Validators.required]],
  });

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    this.overlayConfig.isLoading$ = this.isLoading$.asObservable();
    if (this.overlayData.data.languages) {
      this.languages = this.overlayData.data.languages;
      this.languageForm.get('language').setValue(this.overlayData.data.language);
    }

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.submitTriggerRef.nativeElement.click()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onSave(): void {
    if (this.languageForm.valid) {
      const language = this.languageForm.controls.language.value;
      const businessId = this.overlayData.data.businessId;
      this.isLoading$.next(true);
      this.apiService.updateUserAccount({ language }).pipe(
        switchMap(() => {
          if (businessId) {
            return this.apiService.updateBusinessData(businessId, { defaultLanguage: language });
          } else {
            return of(null);
          }
        }),
        tap(() => {
          this.peOverlayRef.close({ data: language });
        }),
        catchError(() => of(null)),
        tap(() => this.isLoading$.next(false)),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }
}
