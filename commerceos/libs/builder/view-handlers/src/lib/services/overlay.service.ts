import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { PebAnimationPresetService } from '@pe/builder/animations';
import {
  PebAnimation,
  PebAnimationPreset,
  PebElementType,
  PebInteractionType,
  PebOpenOverlayInteraction,
  PebOverlayBackgroundType,
  PebOverlayCloseMode,
  PebOverlayPositionType,
  PebRenderElementModel,
  PebSwapOverlayInteraction,
  PebViewElementEventType,
  isAutoPlayVideo,
  PebRenderUpdateModel,
} from '@pe/builder/core';
import {
  getOverlayBackCssStyle,
  getOverlayContentStyle,
  getOverlayWrapperStyle,
} from '@pe/builder/render-utils';
import {
  PebRenderUpdateAction,  
  PebViewVideoPlayAction,
  PebViewVideoPauseAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewElementService } from './element.service';


const ZINDEX_STEPS = 5;

@Injectable({ providedIn: 'any' })
export class PebViewOverlayService {
  private overlays: OverlayModel[] = [];
  private topOverlay: OverlayModel | undefined;
  private zIndex = 9999000;

  constructor(
    private readonly store: Store,
    private readonly elementService: PebViewElementService,
    private readonly animationPreset: PebAnimationPresetService,
  ) {
  }

  swapOverlay(triggerElement: PebRenderElementModel, interaction: PebSwapOverlayInteraction) {
    const topOverlay = this.getTopOverlay();
    if (topOverlay && topOverlay.triggerBy?.id === triggerElement.id) {
      return;
    }

    topOverlay && this.closeOverlay(topOverlay);
    this.openOverlay(triggerElement, interaction);
  }

  openOverlay(
    triggerElement: PebRenderElementModel,
    interaction: PebOpenOverlayInteraction | PebSwapOverlayInteraction,
  ) {
    const overlay = this.findOrCreateOverlay(triggerElement, interaction);
    if (!overlay) {
      return;
    }

    this.topOverlay = overlay;
    this.zIndex += ZINDEX_STEPS;
    overlay.visible = true;
    overlay.zIndex = this.zIndex;

    this.updateViewModels(overlay);
    this.handleOpenOverlayPlayVideo(overlay);
  }

  closeTopOverlay() {
    const overlay = this.getTopOverlay();
    overlay && this.closeOverlay(overlay);
    this.topOverlay = this.getTopOverlay();
  }

  closeAll() {
    const visibleOverlays = this.overlays.filter(model => model.visible);
    visibleOverlays.forEach((overlay) => {
      this.closeOverlay(overlay);
    });
  }

  closeOverlay(overlay: OverlayModel) {
    overlay.visible = false;
    this.updateViewModels(overlay);
    this.handleCloseOverlayStopVideo(overlay);
  }

  findOrCreateOverlay(
    triggerElement: PebRenderElementModel,
    interaction: PebOpenOverlayInteraction | PebSwapOverlayInteraction,
  ): OverlayModel | undefined {
    const overlayId = triggerElement.id;
    let overlay = this.overlays.find(model => model.id === overlayId);
    if (overlay) {
      return overlay;
    }

    const rootElementId = this.store.selectSnapshot(PebViewState.rootElementId);
    const contentElementId = interaction.content?.elementId;
    const contentElement = this.store.selectSnapshot(PebViewState.elements)[contentElementId];

    let backElement: PebRenderElementModel = {
      id: `overlay-back-${overlayId}`,
      parent: { id: rootElementId },
      type: PebElementType.Shape,
      name: `overlay-back-${overlayId}`,
      children: [],
      container: triggerElement.container,
      style: { host: { display: 'none' } },
      screenKey: triggerElement.screenKey,      
    };

    if (interaction.back?.type === PebOverlayBackgroundType.Element && interaction.back.elementId) {
      const customBackElement = this.elementService.getElementById(interaction.back.elementId);
      customBackElement && (backElement = customBackElement);
    }

    const wrapperElement: PebRenderElementModel = {
      id: `overlay-content-wrapper-${overlayId}`,
      type: PebElementType.Shape,
      name: `overlay-content-wrapper-${overlayId}`,      
      style: { host: {} },
      children: [],
      container: triggerElement.container,
      screenKey: triggerElement.screenKey,
    };

    overlay = {
      id: overlayId,
      contentElement,
      wrapperElement,
      visible: false,
      backElement,
      zIndex: this.zIndex,
      triggerBy: triggerElement,
      interaction,
    };
    this.overlays.push(overlay);

    return overlay;
  }

  updateViewModels(overlay: OverlayModel) {
    if (!overlay.visible || !overlay.contentElement) {
      this.updateCloseOverlayModel(overlay);

      return;
    }

    const rootElementId = this.store.selectSnapshot(PebViewState.rootElementId);
    const interaction = overlay.interaction;
    let position = overlay.interaction.position?.type || PebOverlayPositionType.Viewport;
    let sectionUpdate: PebRenderUpdateModel | undefined = undefined;
    let wrapperElementUpdate: PebRenderUpdateModel | undefined = undefined;
    let containerElementId = rootElementId;

    if (position === PebOverlayPositionType.Section) {
      const section = this.elementService.findSection(overlay.triggerBy);
      if (!section) {
        return;
      }
      sectionUpdate = {
        id: section.id,
        style: {
          host: { zIndex: `${overlay.zIndex + 3}` },
          wrapper: { zIndex: `${overlay.zIndex + 3}` },
        },
      };
      containerElementId = section?.id;
    }

    const contentElementUpdate: PebRenderUpdateModel = {
      id: overlay.contentElement.id,
      parent: { id: containerElementId },
      style: {
        host: getOverlayContentStyle(overlay.interaction.position, overlay.zIndex + 3),
      },
      state: {
        animation: this.getAnimation(interaction.animation?.buildId),
      },
    };

    if (position === PebOverlayPositionType.Viewport
      || position === PebOverlayPositionType.ViewportFixed
    ) {
      wrapperElementUpdate = {
        id: overlay.wrapperElement?.id,
        name: overlay.wrapperElement?.name,
        parent: contentElementUpdate.parent,
        style: {
          host: getOverlayWrapperStyle(interaction.position, overlay.zIndex + 2),
        },
      };
      contentElementUpdate.parent = wrapperElementUpdate;
    }

    const backElementUpdate: PebRenderUpdateModel = {
      id: overlay.backElement.id,
      name: overlay.backElement.name,
      parent: { id: rootElementId },
      style: {
        host: getOverlayBackCssStyle(interaction.back, overlay.zIndex + 1),
      },
    };

    this.store.dispatch(new PebRenderUpdateAction([      
      backElementUpdate,
      wrapperElementUpdate,
      contentElementUpdate,
      sectionUpdate,
    ]));
  }

  updateCloseOverlayModel(overlay: OverlayModel) {
    const displayNone = { host: { display: 'none' } };
    const wrapperUpdate: PebRenderUpdateModel | undefined = overlay.wrapperElement
      ? { id: overlay.wrapperElement.id, style: displayNone }
      : undefined;

    const contentUpdate: PebRenderUpdateModel | undefined = overlay.contentElement
      ? {
      id: overlay.contentElement.id,
      style: displayNone,
      state: { animation: undefined },
      }
      : undefined;

    const backUpdate: PebRenderUpdateModel | undefined = overlay.backElement
      ? { id: overlay.backElement.id, style: displayNone }
      : undefined;

    this.store.dispatch(new PebRenderUpdateAction([
      wrapperUpdate,
      contentUpdate,
      backUpdate,
    ]));
  }

  mouseLeaved(element: PebRenderElementModel) {
    this.topOverlay
      && this.isCloseEvent(element.id, PebOverlayCloseMode.MouseLeave)
      && this.closeOverlay(this.topOverlay);
  }

  elementClicked(element: PebRenderElementModel) {
    this.topOverlay
      && this.isCloseEvent(element.id, PebOverlayCloseMode.ClickOutside)
      && this.closeOverlay(this.topOverlay);
  }

  private isCloseEvent(elementId: string, event: PebOverlayCloseMode): boolean {
    if (
      !this.topOverlay?.contentElement
      || !this.topOverlay?.visible
      || this.topOverlay.interaction.closeMode !== event) {
      return false;
    }

    return event === PebOverlayCloseMode.MouseLeave
      ? this.topOverlay.contentElement.id === elementId
      : this.topOverlay.backElement.id === elementId || this.topOverlay.wrapperElement?.id === elementId;
  }

  private getAnimation(preset?: PebAnimationPreset): PebAnimation | undefined {
    if (!preset?.presetKey) {
      return undefined;
    }
    const { presetKey, config } = preset;

    return this.animationPreset.composeAnimation(presetKey, config);
  }

  private handleOpenOverlayPlayVideo(overlay: OverlayModel) {
    const elements = Object.values(this.elementService.getAllNestedElements(overlay.contentElement));

    elements.filter(elm => isAutoPlayVideo(elm.fill)).forEach(elm =>
      this.store.dispatch(new PebViewVideoPlayAction(
        elm,
        {
          type: PebInteractionType.VideoPlay,
          trigger: PebViewElementEventType.None,
          reset: false,
          videoELementId: elm.id,
        },
      ))
    );
  }

  private handleCloseOverlayStopVideo(overlay: OverlayModel) {
    const elements = Object.values(this.elementService.getAllNestedElements(overlay.contentElement));
    elements.forEach(elm => this.store.dispatch(new PebViewVideoPauseAction(
      elm,
      {
        type: PebInteractionType.VideoPause,
        trigger: PebViewElementEventType.None,
        reset: false,
        videoELementId: elm.id,
      },
    )));
  }

  private getTopOverlay(): OverlayModel | undefined {
    return this.overlays.find(model => model.visible);
  }
}

interface OverlayModel {
  id: string;
  triggerBy: PebRenderElementModel;
  backElement: PebRenderElementModel;
  contentElement: PebRenderElementModel;
  wrapperElement: PebRenderElementModel;
  interaction: PebOpenOverlayInteraction | PebSwapOverlayInteraction;
  visible: boolean;
  zIndex: number;
}
