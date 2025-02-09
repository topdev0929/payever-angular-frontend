import { ChangeDetectionStrategy, Component } from '@angular/core';
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';

import { PebIndexChangeType, PebInteractionType } from '@pe/builder/core';

import { PebInteractionSliderFormService, PebInteractionsFormService } from '..';
import * as constants from '../constants';
import { FormModel } from '../model';


@Component({
  selector: 'peb-interactions-slider-form',
  templateUrl: './interaction-slider-form.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    '../interactions-form-edit.component.scss',
    './interaction-slider-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebInteractionSliderFormComponent {
  form = this.interactionFormService.editForm;
  formValue$ = this.form.valueChanges.pipe(startWith(this.form.value));
  formOptions$ = this.formValue$.pipe(
    map(form => this.getFormOptions(form)),
    startWith({}),
  );

  placeholderElements$ = this.slideFormService.placeholderElements$;  
  indexChangeTypes = constants.indexChangeTypes;
  horizontalAligns = constants.horizontalAligns;
  verticalAligns = constants.verticalAligns;

  contentPages$ = this.interactionFormService.contentPages$;
  contentElements$ = this.formValue$.pipe(
    map((value: FormModel) => value.slider.contentElement.pageId),
    distinctUntilChanged((pageId1, pageId2) => pageId1 === pageId2),
    switchMap(pageId => this.interactionFormService.contentElementsForPage$(pageId)),
  );

  constructor(
    private readonly interactionFormService: PebInteractionsFormService,
    private readonly slideFormService: PebInteractionSliderFormService,
  ) {
  }

  getFormOptions(form: FormModel): FormOptions {
    const isLoad = form.action === PebInteractionType.SliderLoad;
    const isChange = form.action === PebInteractionType.SliderChange;
    const isUnload = form.action === PebInteractionType.SliderUnload;
    const isPlay = form.action === PebInteractionType.SliderPlay
      || form.action === PebInteractionType.SliderTogglePlay;
    const isNumber = form.slider.slideType === PebIndexChangeType.Number;
    const isNext = form.slider.slideType === PebIndexChangeType.Next;
    const isPrev = form.slider.slideType === PebIndexChangeType.Prev;

    if (isUnload) {
      return { showPlaceholderElement: true };
    }

    return {
      showSlideChange: isLoad || isChange,
      showPlaceholderElement: true,
      showContentElement: isLoad,
      showSlideNumber: (isLoad || isChange) && isNumber,
      showSlideLoop: isLoad && (isNext || isPrev),
      showSlideAnimation: isLoad,
      showSlideAlign: isLoad,
      showPlayOptions: isPlay || isLoad && form.slider.autoPlay.onLoad,
      showAutoplayOnloadOption: isLoad,
    };
  }
}

interface FormOptions {
  showPlaceholderElement?: boolean;
  showContentElement?: boolean;
  showSlideChange?: boolean;
  showSlideNumber?: boolean;
  showSlideLoop?: boolean;
  showSlideAnimation?: boolean;
  showSlideAlign?: boolean;
  showPlayOptions?: boolean;
  showAutoplayOnloadOption?: boolean;
}
