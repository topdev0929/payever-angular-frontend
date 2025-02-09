import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  PebCloseOverlayInteraction,
  PebInteraction,
  PebInteractionBase,
  PebInteractionType,
  PebOpenOverlayInteraction,
  PebOverlayBackgroundType,
  PebSwapOverlayInteraction,
  isOpenOverlayInteraction,
  isSwapOverlayInteraction,
  isAnimationInteraction,
  isSliderInteraction,
  isVideoInteraction,
  PebMap,
  PebPage,
  isIntegrationInteraction,
} from '@pe/builder/core';
import { PebElement, getShortRandomKey, isOutPage } from '@pe/builder/render-utils';
import { PebEditorState, PebElementsState, PebGetPageElements, PebUpdateElementDefAction } from '@pe/builder/state';

import { elementToOption } from '../form.utils';
import { PebFormOption } from '../models';

import { PebInteractionAnimationFormService } from './animation';
import * as constants from './constants';
import { PebInteractionIntegrationFormService } from './integration';
import { FormModel, ListItemModel } from './model';
import { PebInteractionSliderFormService } from './slider';
import { PebInteractionVideoFormService } from './video';

@Injectable()
export class PebInteractionsFormService {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebElementsState.allElements) private readonly elements$!: Observable<PebElement[]>;
  @Select(PebEditorState.pages) private readonly pages$!: Observable<PebMap<PebPage>>;

  interactions$: Observable<ListItemModel[]> = this.selectedElements$.pipe(
    filter(elements => elements?.length === 1),
    map((elements) => {
      const element = elements[0];
      const interactions = element.interactions;

      return Object.entries(interactions ?? {}).map(
        ([key, interaction]) => this.interactionToListItem(key, interaction)
      ).filter(item => item?.interaction);
    }),
  );

  contentPages$: Observable<PebFormOption[]> = this.pages$.pipe(
    map(map => Object.values(map)),
    map(pages => pages.map(page => ({ value: page.id, name: page.name }))),
    map(options => [
      { value: '', name: '- Current Page -' },
      ...options,
    ]),
  )

  contentElements$ = this.elements$.pipe(
    filter(elements => !!elements),
    map(elements => elements
      .filter(elm => isOutPage(elm) && !!elm.name)
      .map(elementToOption),
    ),
  );

  editForm: FormGroup = this.buildForm();

  constructor(
    private readonly store: Store,
    private readonly formBuilder: FormBuilder,
    private readonly animationFormService: PebInteractionAnimationFormService,
    private readonly sliderFormService: PebInteractionSliderFormService,
    private readonly videoFormService: PebInteractionVideoFormService,
    private readonly interactionIntegrationService: PebInteractionIntegrationFormService
  ) {
  }

  contentElementsForPage$(pageId: string): Observable<PebFormOption[]> {
    if (!pageId) {
      return this.contentElements$;
    }

    const page = this.store.selectSnapshot(PebEditorState.pages)[pageId];
    const hasElements = page.element && Object.keys(page.element).length > 0;
    !hasElements && this.store.dispatch(new PebGetPageElements(page));

    return this.pages$.pipe(
      map(pages => pages[pageId]),
      filter(page => !!page),
      map((page) => {
        return Object.values(page.element ?? {})
          .filter(elm => isOutPage(elm) && !!elm.name)
          .map(elementToOption);
      }),
    );
  }

  addNewInteraction() {
    const model: FormModel = {
      ...constants.initialFormValue,
      key: getShortRandomKey(6),
    };

    this.editForm.setValue(model);
    this.saveInteraction(model.key, this.formToInteraction(model));
  }

  setEditingInteraction(key: string, interaction: PebInteraction) {
    const model = this.interactionToForm(key, interaction);
    this.editForm.setValue(model);
  }

  saveInteraction(key: string, interaction: PebInteraction) {
    this.store.dispatch(new PebUpdateElementDefAction([{
      id: this.selectedElementId,
      interactions: { [key]: interaction },
    }]));
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      ...constants.initialFormValue,
      position: this.formBuilder.group({
        ...constants.initialFormValue.position,
      }),
      slider: this.sliderFormService.buildForm(),
      animation: this.animationFormService.buildForm(),
      video: this.videoFormService.buildForm(),

      contentElement: this.formBuilder.group(constants.initialFormValue.contentElement),
    });
  }

  removeInteraction(key: string) {
    this.store.dispatch(new PebUpdateElementDefAction([{
      id: this.selectedElementId,
      interactions: { [key]: undefined },
    }]));
  }

  interactionToListItem(key: string, interaction: PebInteraction): ListItemModel | undefined {
    if (!interaction) {
      return undefined;
    }

    const trigger = constants.interactionTriggers.find(trigger => trigger.value === interaction.trigger);
    const action = constants.actions.find(action => action.value === interaction.type);

    return {
      key,
      interaction,
      trigger: trigger?.name ?? interaction.trigger,
      action: action?.name ?? interaction.type,
    };
  }

  interactionToForm(key: string, interaction: Partial<PebInteraction>): FormModel {
    const init = constants.initialFormValue;

    const model: FormModel = {
      ...constants.initialFormValue,
      key,
      action: interaction.type,
      trigger: interaction.trigger,
    };

    if (isAnimationInteraction(interaction)) {
      model.placeholderElementId = interaction.placeholder?.elementId ?? '';
      model.animation = this.animationFormService.toAnimationForm(interaction);
    }

    if (isSliderInteraction(interaction)) {
      model.slider = this.sliderFormService.toSliderForm(interaction);
    }

    if (isVideoInteraction(interaction)) {
      model.video = this.videoFormService.toVideoForm(interaction);
    }

    if (isIntegrationInteraction(interaction)) {
      model.integrationAction = this.interactionIntegrationService.toIntegrationForm(interaction);
    }

    if (isOpenOverlayInteraction(interaction) || isSwapOverlayInteraction(interaction)) {
      model.contentElement = { ...init.contentElement, ...interaction.content };
      model.buildIn = interaction.animation?.buildId?.presetKey ?? '';
      model.buildInConfig = interaction.animation?.buildId?.config ?? {};
      model.backgroundType = interaction.back?.type ?? PebOverlayBackgroundType.Default;
      model.backgroundElementId = interaction.back?.elementId ?? '';
      model.position = {
        type: interaction.position?.type ?? init.position.type,
        left: interaction.position?.left ?? init.position.left,
        top: interaction.position?.top ?? init.position.top,
        right: interaction.position?.right ?? init.position.right,
        bottom: interaction.position?.bottom ?? init.position.bottom,
        width: interaction.position?.width ?? init.position.width,
        height: interaction.position?.height ?? init.position.height,
      };
      model.closeMode = interaction.closeMode ?? init.closeMode;
      model.backFill = interaction.back?.fill ?? init.backFill;
    }

    return model;
  }

  formToInteraction(form: FormModel): PebInteraction {
    const interaction = this.formToInteractionBase(form);

    if (isAnimationInteraction(interaction)) {
      return this.animationFormService.toInteraction(form);
    }

    if (isSliderInteraction(interaction)) {
      return this.sliderFormService.toInteraction(form);
    }

    if (isVideoInteraction(interaction)) {
      return this.videoFormService.toInteraction(form);
    }

    if (isIntegrationInteraction(interaction)) {
      return this.interactionIntegrationService.toInteraction(form);
    }

    if (form.action === PebInteractionType.OpenOverlay) {
      return this.formToOpenOverlayInteraction(form);
    }

    if (form.action === PebInteractionType.SwapOverlay) {
      return this.formToSwapOverlayInteraction(form);
    }

    if (form.action === PebInteractionType.CloseOverlay) {
      return this.formToCloseOverlayInteraction(form);
    }

    return interaction;
  }

  formToOpenOverlayInteraction(form: FormModel): PebOpenOverlayInteraction {
    return {
      ...this.formToSwapOverlayInteraction(form),
      type: PebInteractionType.OpenOverlay,
    };
  }

  formToSwapOverlayInteraction(form: FormModel): PebSwapOverlayInteraction {
    const interaction: PebSwapOverlayInteraction = {
      type: PebInteractionType.SwapOverlay,
      content: form.contentElement,
      trigger: form.trigger,
      animation: {
        buildId: {
          presetKey: form.buildIn ? form.buildIn : undefined,
          config: form.buildInConfig,
        },
      },
      back: {
        type: form.backgroundType,
        elementId: form.backgroundElementId,
        fill: form.backFill,
      },
      position: form.position,
      closeMode: form.closeMode,
    };

    return interaction;
  }

  formToCloseOverlayInteraction(model: FormModel): PebCloseOverlayInteraction {
    return {
      type: PebInteractionType.CloseOverlay,
      trigger: model.trigger,
    };
  }

  formToInteractionBase(model: FormModel): PebInteractionBase {
    return {
      type: model.action,
      trigger: model.trigger,      
    };
  }

  get selectedElementId(): string {
    return this.store.selectSnapshot(PebElementsState.selectedElementIds)[0];
  }
}
