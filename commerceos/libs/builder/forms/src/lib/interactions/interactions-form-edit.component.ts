import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, merge } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import {  
  PebFillType,  
  PebInteractionType,
  PebOverlayBackgroundType,
  PebSolidFill,
  isAnimationInteraction,
  isEqualRGBA,
  isSliderInteraction,
  isVideoInteraction,
} from '@pe/builder/core';
import { getPreviewBackgroundStyle } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebSecondaryTab } from '@pe/builder/state';

import { timings } from '../animation/constants';
import { PebColorForm } from '../color';

import * as constants from './constants';
import { PebInteractionsFormService } from './interactions-form.service';
import { FormModel } from './model';


@Component({
  selector: 'peb-interactions-form-edit',
  templateUrl: './interactions-form-edit.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './interactions-form-edit.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebInteractionsFormEditComponent implements OnDestroy {
  triggers = constants.interactionTriggers;
  actions = constants.actions;
  backgroundTypes = constants.backgroundTypes;
  buildInEffects = constants.buildInEffects;
  positionTypes = constants.positionTypes;
  closeModes = constants.closeModes;
  indexChangeTypes = constants.indexChangeTypes;
  animationTimings = timings;

  form = this.interactionsFormService.editForm;
  contentPages$ = this.interactionsFormService.contentPages$;
  backgroundElements$ = this.interactionsFormService.contentElements$;

  formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));
  backStyle$ = this.formValue$.pipe(
    map(value => getPreviewBackgroundStyle(value.backFill)),
  );

  showBackground$ = this.formValue$.pipe(
    map(val => val.action === PebInteractionType.OpenOverlay || val.action === PebInteractionType.SwapOverlay)
  );

  formOptions$ = this.formValue$.pipe(
    map(form => this.getFormOptions(form)),
  );

  formChanged$ = this.form.valueChanges.pipe(
    filter(() => this.form.dirty),
    tap(() => {
      this.submitChanges();
      this.form.markAsPristine();
    }),
  );

  contentElements$ = this.formValue$.pipe(
    map((value: FormModel) => value.contentElement.pageId),
    distinctUntilChanged((pageId1, pageId2) => pageId1 === pageId2),
    switchMap(pageId => this.interactionsFormService.contentElementsForPage$(pageId)),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly interactionsFormService: PebInteractionsFormService,
    private readonly sidebarService: PebSideBarService,
  ) {
    merge(this.formChanged$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }

  removeTrigger() {
    this.interactionsFormService.removeInteraction(this.form.value.id);
  }

  submitChanges() {
    const value: FormModel = this.form.value;
    const interaction = this.interactionsFormService.formToInteraction(value);
    this.interactionsFormService.saveInteraction(value.key, interaction);
  }

  showBackFillForm() {
    const colorForm = this.sidebarService.openDetail(
      PebColorForm,
      { backTitle: 'Interaction', title: 'Color' },
    );
    const backFillControl = this.form.get('backFill');
    const colorFormControl = new FormControl();
    colorFormControl.patchValue(backFillControl.value);
    colorForm.instance.formControl = colorFormControl;
    colorForm.instance.activeTab = PebSecondaryTab.Color;

    const blurred$ = colorForm.instance.blurred.pipe(
      map(() => colorFormControl.value),
      distinctUntilChanged((a, b) => isEqualRGBA(a, b)),
      tap((value) => {
        const color: PebSolidFill = {
          type: PebFillType.Solid,
          color: value,
        };
        this.form.patchValue({ backFill: color });
        this.submitChanges();
      }),
    );

    blurred$.pipe(
      takeUntil(colorForm.instance.destroy$),
    ).subscribe();
  }

  getFormOptions(form: FormModel): FormOptions {
    const interaction = { type: form.action };

    if (form.action === PebInteractionType.OpenOverlay || form.action === PebInteractionType.SwapOverlay) {
      return {
        showBackground: true,
        showBuildInEffect: true,
        showContentElement: true,
        showBackgroundElement: form.backgroundType === PebOverlayBackgroundType.Element,
        showPositionType: true,
        showPositionForm: true,
        showCloseMode: true,
        showBackFill: form.backgroundType === PebOverlayBackgroundType.Fill,        
      };
    }

    return {
      showAnimationForm: isAnimationInteraction(interaction),
      showSliderForm: isSliderInteraction(interaction),
      showVideoForm: isVideoInteraction(interaction),
      showIntegrations: form.action === PebInteractionType.IntegrationAction,
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}

interface FormOptions {
  showContentElement?: boolean;
  showPlaceholderElement?: boolean;
  showBuildInEffect?: boolean
  showBackground?: boolean;
  showBackgroundElement?: boolean;
  showPositionType?: boolean;
  showPositionForm?: boolean;
  showCloseMode?: boolean;
  showBackFill?: boolean;
  showAnimationForm?: boolean;
  showSliderForm?: boolean;
  showVideoForm?: boolean;
  showIntegrations?: boolean;
}
