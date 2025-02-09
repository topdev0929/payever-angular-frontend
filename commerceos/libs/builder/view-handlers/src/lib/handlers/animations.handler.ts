import { Injectable } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  PebAnimation,
  PebViewElementEventType,
  PebScreen,
  PebIndexChangeType,
  PebAnimationBindingType,
  hasAnimationBinding,
  PebRenderUpdateModel,
} from '@pe/builder/core';
import {
  PebViewSlideUpdatedAction,
  PebRenderUpdateAction,
  PebViewAnimationPlayAction,
  PebViewAnimationKeyframePlayAction,
  PebViewPageRenderingAction,
  PebViewSetFocusedSectionAction,
  PebViewElementEnteredViewportAction,
  PebViewContextUpdatedAction,
  PebViewContextRenderAllAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewAnimationService, PebViewElementService } from '../services';
import { PebViewContextTriggerService } from '../services/context-trigger.service';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewAnimationsHandler extends PebViewBaseHandler {
  @Select(PebViewState.screen) private readonly screen$!: Observable<PebScreen>;

  triggers: TriggerModel[] = [];
  actionBuffer: { [placeholderId: string]: PebViewSlideUpdatedAction } = {};

  pageRendering$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageRenderingAction),
    tap((action: PebViewPageRenderingAction) => {
      Object.values(action.elements).forEach((element) => {
        element.animations && Object.entries(element.animations).forEach(([key, anim]) => {
          this.collectAnimationTriggers(element.id, anim, key);
        });
      });
    }),
  );

  elementStateUpdated$ = this.actions$.pipe(
    ofActionDispatched(PebRenderUpdateAction),
    tap((action: PebRenderUpdateAction) => {
      const updates = action.updates.filter(update => !!update && update.state !== undefined);
      updates.forEach(update => update && this.handleElementStateUpdated(update));
    }),
  );

  focusedSection$ = this.actions$.pipe(
    ofActionDispatched(PebViewSetFocusedSectionAction),
    tap((action: PebViewSetFocusedSectionAction) => {
      const triggers = this.triggers.filter((trigger) => {
        return trigger.animation.trigger === PebViewElementEventType.ViewportFocusSection
          && trigger.animation.triggerSetting?.bindingType === PebAnimationBindingType.Keyframe;
      });

      triggers.forEach((trigger) => {
        const keyframeIndex = action.sectionId === trigger.animation.triggerSetting?.contentElementId ? 1 : 0;

        this.viewAnimationService.changeKeyframe(
          trigger.elementId,
          trigger.animation,
          { type: PebIndexChangeType.Number, number: keyframeIndex + 1 }
        );
      });
    }),
  );

  enteredViewport$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementEnteredViewportAction),
    tap((action: PebViewElementEnteredViewportAction) => {
      if (!action.element.animations) {
        return;
      }
      const animations = Object.values(action.element.animations);
      const viewportAnimation = animations.find(anim =>
        anim.trigger === PebViewElementEventType.ViewportEnter && hasAnimationBinding(anim)
      );

      this.store.dispatch(new PebRenderUpdateAction([{
        id: action.element.id,
        state: { animation: viewportAnimation },
      }]));
    })
  )

  playAnimation$ = this.actions$.pipe(
    ofActionDispatched(PebViewAnimationPlayAction),
    tap((action: PebViewAnimationPlayAction) => {
      const element = this.elementService.getElementById(action.elementId);
      const animation = Object.values(element?.animations ?? {})[0];
      if (!animation) {
        return;
      }

      this.store.dispatch(new PebRenderUpdateAction([{
        id: action.elementId,
        state: { animation },
      }]));
    }),
  );

  playKeyframe$ = this.actions$.pipe(
    ofActionDispatched(PebViewAnimationKeyframePlayAction),
    tap((action: PebViewAnimationKeyframePlayAction) => {
      const element = this.elementService.getElementById(action.elementId);
      const animation = Object.values(element?.animations ?? {})[0];

      animation && this.viewAnimationService.changeKeyframe(
        action.elementId,
        animation,
        action.keyframeChange,
      );
    }),
  );

  contextUpdated$ = this.actions$.pipe(
    ofActionDispatched(PebViewContextUpdatedAction, PebViewContextRenderAllAction),
    tap(() => {
      const elements = Object.values(this.store.selectSnapshot(PebViewState.elements));
      const triggers: TriggerModel[] = [];

      elements.forEach((element) => {
        if (!element.animations) {
          return;
        }

        Object.entries(element.animations).forEach(([animationKey, animation]) => {
          const setting = animation.triggerSetting;
          animation.trigger === PebViewElementEventType.ContextData
            && setting?.bindingType === PebAnimationBindingType.Keyframe
            && triggers.push({ elementId: element.id, animation, animationKey });
        });
      });

      triggers.forEach((trigger) => {
        const setting = trigger.animation.triggerSetting;
        if (!setting) {
          return;
        }
        const keyframeIndex = this.contextTriggerService.getTriggerKeyframe(setting, trigger.elementId);

        this.viewAnimationService.changeKeyframe(
          trigger.elementId,
          trigger.animation,
          { type: PebIndexChangeType.Number, number: keyframeIndex + 1 }
        );
      });
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly elementService: PebViewElementService,
    private readonly viewAnimationService: PebViewAnimationService,
    private readonly contextTriggerService: PebViewContextTriggerService,
  ) {
    super();
    this.startObserving(
      this.pageRendering$,
      this.elementStateUpdated$,
      this.focusedSection$,
      this.enteredViewport$,
      this.playAnimation$,
      this.playKeyframe$,
      this.contextUpdated$,
    );
  }

  private handleElementStateUpdated(update: PebRenderUpdateModel) {
    const triggers: TriggerModel[] = [];

    if (update?.state?.slider !== undefined) {
      if (update.state.slider.slideIndex !== undefined) {
        triggers.push(... this.findTriggers(PebViewElementEventType.SliderIndexChange));
      }

      if (update.state.slider.contentElementId !== undefined) {
        triggers.push(... this.findTriggers(PebViewElementEventType.SliderContentChange));
      }

      if (update.state.slider.playing !== undefined) {
        triggers.push(...this.findTriggers(PebViewElementEventType.SliderPlay));
        triggers.push(...this.findTriggers(PebViewElementEventType.SliderPause));
      }
    }

    if (update.state?.video) {
      if (update.state.video.playStatus !== undefined) {
        triggers.push(...this.findTriggers(PebViewElementEventType.VideoPlay));
        triggers.push(...this.findTriggers(PebViewElementEventType.VideoPause));
      }
    }

    if (update?.state?.keyframe?.keyframeIndex !== undefined) {
      const animationTriggers = this.findTriggers(PebViewElementEventType.AnimationKeyframeChange);
      animationTriggers.forEach(trigger => this.triggerAnimation(trigger, update));
    }

    triggers.forEach(trigger => this.triggerAnimation(trigger, update));
  }

  private collectAnimationTriggers(
    elementId: string,
    animation: PebAnimation,
    animationKey: string,
  ) {
    const index = this.triggers.findIndex(trg => trg.animationKey === animationKey && trg.elementId === elementId);
    const trigger: TriggerModel = { elementId, animation, animationKey };

    index > -1
      ? this.triggers[index] = trigger
      : this.triggers.push(trigger);
  }

  private triggerAnimation(trigger: TriggerModel, update: PebRenderUpdateModel) {
    const setting = trigger.animation.triggerSetting;
    if (setting?.sourceElementId !== update.id) {
      return;
    }

    const keyframeIndex = this.viewAnimationService.mapEventToKeyframe(trigger.animation, update);
    const elementId = trigger.elementId;
    const element = this.elementService.getElementById(elementId);
    if (!element) {
      return;
    }

    if (setting.bindingType === PebAnimationBindingType.Animation) {
      this.store.dispatch(new PebRenderUpdateAction([{
        id: trigger.elementId,
        state: {
          animation: keyframeIndex > 0
            ? trigger.animation
            : undefined,
        },
      }]));
    }
    else if (setting.bindingType === PebAnimationBindingType.Keyframe) {
      const oldIndex = element?.state?.keyframe?.keyframeIndex;
      oldIndex !== keyframeIndex
        && this.viewAnimationService.playKeyframeByIndex(element, trigger.animation, keyframeIndex);
    }
  }

  private findTriggers(event: PebViewElementEventType, bindingType?: PebAnimationBindingType): TriggerModel[] {
    let triggers = this.triggers.filter(trigger => trigger.animation?.trigger === event);

    if (bindingType !== undefined) {
      triggers = triggers.filter(trigger => trigger.animation.triggerSetting?.bindingType === bindingType);
    }

    return triggers;
  }
}

interface TriggerModel {
  elementId: string;
  animationKey: string;
  animation: PebAnimation;
}
