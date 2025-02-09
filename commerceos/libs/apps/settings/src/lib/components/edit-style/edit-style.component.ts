import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PebColorPickerService } from '@pe/builder-color-picker';
import { BusinessThemeSettings, BusinessThemeSettingsColors } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { BusinessState, UpdateBusinessData } from '@pe/user';

import { BusinessEnvService } from '../../services';

@Component({
  selector: 'peb-edit-style',
  templateUrl: './edit-style.component.html',
  styleUrls: ['./edit-style.component.scss'],
  providers: [PeDestroyService, PebColorPickerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditStyleComponent implements OnInit {
  @SelectSnapshot(BusinessState.businessThemeSettings) businessThemeSettings: BusinessThemeSettings;

  public styleForm: FormGroup = this.fb.group({
    primaryColor: [''],
    secondaryColor: [''],
  });

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private envService: BusinessEnvService,
    private peOverlayRef: PeOverlayRef,
    private store: Store,
    private fb: FormBuilder,
    private readonly destroy$: PeDestroyService,
  ) {
  }

  ngOnInit() {
    const primaryColor = this.businessThemeSettings?.primaryColor || '#0371E2';
    const secondaryColor = this.businessThemeSettings?.secondaryColor || '#fefefe';
    this.styleForm.controls.primaryColor.patchValue(primaryColor);
    this.styleForm.controls.secondaryColor.patchValue(secondaryColor);

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.onSave()),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public onSave() {
    if (this.styleForm.valid) {
      const data: BusinessThemeSettingsColors = {
        _id: this.businessThemeSettings?._id,
        theme: this.businessThemeSettings?.theme,
        primaryColor: this.styleForm.controls.primaryColor.value,
        secondaryColor: this.styleForm.controls.secondaryColor.value,
      };
      this.store.dispatch(new UpdateBusinessData(this.envService.businessUuid, { themeSettings: data }))
        .pipe(
          takeUntil(this.destroy$),
        ).subscribe(()=>{
          this.peOverlayRef.close();
        });
    }
  }
}
