import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  PEB_WHITE_RGBA,
  PebAnimation,
  PebAnimationDirection,
  PebAnimationProperty,
  PebViewElementEventType,
  PebAnimationValueType,
  PebInteractionType,
  PebUnit,
  isSliderLoadInteraction,
  PebAnimationBindingType,
  isVideo,
} from '@pe/builder/core';
import { PebElement, getPebSize, getShortRandomKey } from '@pe/builder/render-utils';
import { PebElementsState, PebUpdateElementDefAction } from '@pe/builder/state';
import { TranslateService } from '@pe/i18n-core';

import { interactionTriggers } from '../interactions/constants';

import * as constants from './constants';
import { initialFormValue } from './constants';
import { FormModel, PropertyFormModel, ListItemModel, KeyframeFormModel } from './models';

@Injectable()
export class PebAnimationsFormService {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebElementsState.allElements) private readonly elements$!: Observable<PebElement[]>;

  animations$: Observable<ListItemModel[]> = this.selectedElements$.pipe(
    filter(elements => elements?.length > 0),
    map((elements) => {
      const animations = Object.entries(elements[0].animations ?? {});

      return animations.map(([key, value]) => {
        const trigger = interactionTriggers.find(tr => tr.value === value.trigger);
        const bindingType = value.triggerSetting?.bindingType ?? PebAnimationBindingType.Animation;

        return {
          key,
          animation: value,
          trigger: trigger?.name ?? value.trigger,
          action: bindingType === PebAnimationBindingType.Animation
            ? this.translationService.translate('builder-app.forms.animation.animate')
            : 'Keyframe',
        };
      });
    }),
  );

  editForm: FormGroup = this.buildForm();

  sourceElements$ = this.elements$.pipe(
    filter(elements => !!elements),
    map(elements => elements
      .filter(elm => elm.name)
      .filter(elm => this.isPlaceholder(elm, elements) || this.hasAnimation(elm) || this.hasVideo(elm))
      .map(elm => ({ name: elm.name, value: elm.id }))
    ),
    map(values => [{ name: '-Self-', value: '' }, ...values]),
  );

  contentElements$ = this.elements$.pipe(
    filter(elements => !!elements),
    map(elements => elements
      .filter(elm => !!elm.name)
      .map(elm => ({ name: elm.name, value: elm.id }))
    ),
  );


  constructor(
    private readonly store: Store,
    private readonly formBuilder: FormBuilder,
    private readonly translationService: TranslateService,
  ) {
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      ...initialFormValue,
      keyframes: this.formBuilder.array([
        new FormGroup({ offset: new FormControl(0), properties: new FormArray([]) }),
      ]),
      triggerSetting: this.formBuilder.group(initialFormValue.triggerSetting),
      scrollBinding: this.formBuilder.group(initialFormValue.scrollBinding),
    });
  }

  addNewAnimation() {
    const model: FormModel = {
      ...initialFormValue,
      key: getShortRandomKey(6),
    };

    this.buildFormControls(model.keyframes);
    this.editForm.setValue(model);
    this.submitAnimationForm();
  }

  setEditingAnimation(key: string, animation: PebAnimation) {
    const model = this.animationToForm(key, animation);
    this.buildFormControls(model.keyframes);
    this.editForm.setValue(model);
    this.editForm.markAsUntouched();
    this.editForm.markAsPristine();
  }

  buildFormControls(keyframes: KeyframeFormModel[]) {
    const keyframesArray = keyframes.map(keyframe => this.getKeyframeFormGroup(keyframe));
    this.editForm.setControl('keyframes', new FormArray(keyframesArray));
  }

  submitAnimationForm() {
    const value = this.editForm.getRawValue();
    const animation = this.formToAnimation(value);

    const keyMappers = constants.keyframeMapperProviders[value.trigger];
    !keyMappers?.length && (animation.triggerSetting.bindingType = PebAnimationBindingType.Animation);

    this.store.dispatch(new PebUpdateElementDefAction([{
      id: this.selectedElementId,
      animations: { [value.key]: animation },
    }]));

    this.editForm.markAsPristine();
    this.editForm.markAsUntouched();
  }

  removeAnimation(key: string) {
    this.store.dispatch(new PebUpdateElementDefAction([{
      id: this.selectedElementId,
      animations: { [key]: undefined },
    }]));
  }

  animationToForm(key: string, animation: PebAnimation): FormModel {
    const def = initialFormValue;

    return {
      key,
      trigger: animation.trigger ?? PebViewElementEventType.None,
      delay: animation.delay ?? 0,
      duration: animation.duration ?? def.duration,
      fill: animation.fill ?? def.fill,
      infiniteLoop: animation.infiniteLoop ?? def.infiniteLoop,
      iteration: animation.iteration ?? def.iteration,
      keyframes: (animation.keyframes ?? [])
        .map(kf => ({
          offset: { unit: PebUnit.Percent, value: kf.offset },
          properties: kf.properties.map(this.toPropertyFormModel),
        })),
      timing: animation.timing ?? def.timing,
      triggerSetting: {
        keyframeMapper: animation.triggerSetting?.keyframeMapper ?? def.triggerSetting.keyframeMapper,
        sourceElementId: animation.triggerSetting?.sourceElementId ?? def.triggerSetting.sourceElementId,
        bindingType: animation.triggerSetting?.bindingType ?? def.triggerSetting.bindingType,
        contentElementId: animation.triggerSetting?.contentElementId ?? def.triggerSetting.contentElementId,
        equalNumber: animation.triggerSetting?.equalNumber ?? def.triggerSetting.equalNumber,
        contextField: animation.triggerSetting?.contextField ?? def.triggerSetting?.contextField,
        contextTag: animation.triggerSetting?.contextTag ?? def.triggerSetting?.contextTag,
      },
      scrollBinding: {
        target: animation.scrollBinding?.target ?? def.scrollBinding.target,
        start: animation.scrollBinding?.start ?? def.scrollBinding.start,
        end: animation.scrollBinding?.end ?? def.scrollBinding.end,
      },
    };
  }

  formToAnimation(model: FormModel): PebAnimation {
    const formValue = this.editForm.getRawValue();
    this.sortKeyframes(formValue.keyframes);

    return {
      id: model.key,
      duration: model.duration,
      fill: model.fill,
      timing: model.timing,
      delay: model.delay,
      direction: PebAnimationDirection.Normal,
      infiniteLoop: model.infiniteLoop,
      iteration: model.iteration,
      trigger: model.trigger,
      keyframes: model.keyframes.map(kf => ({
        offset: kf.offset.value ?? 0,
        properties: kf.properties.map(this.toProperty),
      })),
      triggerSetting: {
        ...initialFormValue.triggerSetting,
        ...model.triggerSetting,
      },
      scrollBinding: { ...initialFormValue.scrollBinding, ...model.scrollBinding },
    };
  }

  sortKeyframes(keyframes: { offset: number }[]) {
    keyframes?.sort((a, b) => a.offset - b.offset);
  }

  getKeyframeFormGroup(keyframe: KeyframeFormModel): FormGroup {
    const propertiesArray: FormGroup[] = keyframe.properties.map((property) => {
      return this.getPropertyFormGroup(property);
    });

    const keyframeGroup = new FormGroup({
      offset: new FormControl(keyframe.offset),
      properties: new FormArray(propertiesArray),
    });

    return keyframeGroup;
  }

  getPropertyFormGroup(property: PropertyFormModel): FormGroup {
    return this.formBuilder.group({
      key: property.key,
      values: this.formBuilder.group({
        [PebAnimationValueType.Size]: this.formBuilder.control(property.values.size),
        [PebAnimationValueType.Color]: this.formBuilder.control(property.values.color),
        [PebAnimationValueType.XY]: this.formBuilder.group(property.values.xy),
      }),
    });
  }

  toPropertyFormModel(property: PebAnimationProperty): PropertyFormModel {
    const key = property.key;
    const inputType = constants.propertiesMap[key]?.inputType ?? PebAnimationValueType.Size;
    const values: any = {
      [PebAnimationValueType.Size]: getPebSize(0),
      [PebAnimationValueType.Color]: PEB_WHITE_RGBA,
      [PebAnimationValueType.XY]: { x: 0, y: 0 },
    };
    values[inputType] = property.value;

    return { key, values };
  }

  toProperty(property: PropertyFormModel): PebAnimationProperty {
    const key = property.key;
    const inputType = constants.propertiesMap[key]?.inputType ?? PebAnimationValueType.Size;
    const value = property.values[inputType];

    return { key, value };
  }

  suggestNewProperty(): PropertyFormModel {
    return initialFormValue.keyframes[0].properties[0];
  }

  get selectedElementId(): string {
    return this.store.selectSnapshot(PebElementsState.selectedElementIds)[0];
  }

  private isPlaceholder(element: PebElement, elements: PebElement[]): boolean {
    if (element.interactions) {
      const interactions = Object.values(element.interactions);
      if (interactions.some(item =>
        isSliderLoadInteraction(item)
        && item.type === PebInteractionType.SliderLoad
        && !item.placeholder?.elementId)
      ) {
        return true;
      }
    }

    return elements.filter(elm => elm.interactions).some((elm) => {
      const interactions = Object.values(elm.interactions);

      return interactions.some(item => isSliderLoadInteraction(item) && item.placeholder?.elementId === element.id);
    });
  }

  private hasAnimation(element: PebElement): boolean {
    return element.animations
      && Object.values(element.animations).some(anim => anim.keyframes?.length > 0);
  }

  private hasVideo(element: PebElement): boolean {
    return isVideo(element.styles.fill);
  }
}
