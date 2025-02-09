import { DOCUMENT, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, RendererFactory2 } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  PebSliderChangeInteraction,
  PebRenderElementModel,
  PebSlidesInteractionBase,
  PebElementType,
  PebIndexChange,
  PebSliderPlayInteraction,
  PebSliderPauseInteraction,
  PebSliderTogglePlayInteraction,
  PebRenderElementState,
  PebIndexChangeType,
  PebRenderUpdateModel,
} from '@pe/builder/core';
import { getNextIndex, getSlidesContentCssStyle, getSlidesWrapperCssStyle } from '@pe/builder/render-utils';
import { PebRenderUpdateAction, PebViewSlideUpdatedAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

@Injectable()
export class PebViewSliderService {
  private slideHolder: { [id: string]: SliderModel } = {};

  constructor(
    @Inject(DOCUMENT) public document: Document,
    @Inject(PLATFORM_ID) private platformId: any,    
    public readonly rendererFactory: RendererFactory2,
    private readonly store: Store,
  ) {
  }

  loadSlides(
    placeholderElementId: string,
    contentElementId: string,
    interaction: PebSlidesInteractionBase,
  ) {
    if (!placeholderElementId || !contentElementId) {
      return;
    }

    const existSlider = this.slideHolder[placeholderElementId];
    if (existSlider && existSlider.content?.id === contentElementId) {
      return;
    }

    this.unloadSlides(placeholderElementId);

    const content = this.store.selectSnapshot(PebViewState.elements)[contentElementId];
    const placeholder = this.store.selectSnapshot(PebViewState.elements)[placeholderElementId];

    const slider: SliderModel = {
      content,
      placeholder,
      interaction,
      slideIndex: 0,
      slides: this.getContentSlides(content),      
    };
    slider.slideIndex = this.getNextSlideNumber(slider, interaction.slide);
    this.slideHolder[placeholderElementId] = slider;

    interaction.autoPlay?.onLoad && this.attachAutoPlayer(slider, interaction);

    this.updateViewModels(slider);
  }

  unloadSlides(placeholderElementId: string) {
    const slider = this.slideHolder[placeholderElementId];
    this.detachAutoPlayer(slider);
    if (!slider?.content) {
      return;
    }

    const rootElementId = this.store.selectSnapshot(PebViewState.rootElementId);

    this.store.dispatch(new PebRenderUpdateAction([
      {
        id: slider.content.id,
        parent: { id: rootElementId },
        style: {
          host: { display: 'none' },
          wrapper: slider.content.style.wrapper ? { display: 'none' } : undefined,
        },
      },
      {
        id: slider.placeholder.id,
        state: {
          slider: {
            contentElementId: '',
            slideIndex: 0,
            slidesCount: 0,
            playing: false,
          },
        },
      },
    ]));

    delete this.slideHolder[placeholderElementId];
  }

  changeSlide(interaction: PebSliderChangeInteraction) {
    const contentHolderId = interaction.placeholder?.elementId;
    const slide = this.slideHolder[contentHolderId];
    if (!slide) {
      return;
    }
    slide.slideIndex = this.getNextSlideNumber(slide, interaction.slide);
    this.updateViewModels(slide);
  }

  togglePlaySlider(interaction: PebSliderTogglePlayInteraction) {
    const contentHolderId = interaction.placeholder?.elementId;
    const slider = this.slideHolder[contentHolderId];
    this.isPlaying(slider)
      ? this.pauseSlider(interaction)
      : this.playSlider(interaction);
  }

  playSlider(interaction: PebSliderPlayInteraction | PebSliderTogglePlayInteraction) {
    const contentHolderId = interaction.placeholder?.elementId;
    const slider = this.slideHolder[contentHolderId];
    if (!slider?.placeholder) {
      return;
    }

    this.attachAutoPlayer(slider, interaction);

    this.store.dispatch(new PebRenderUpdateAction([{
      id: slider.placeholder.id,
      state: {
        slider: {
          playing: this.isPlaying(slider),
        },
      } as PebRenderElementState,
    }]));
  }

  pauseSlider(interaction: PebSliderPauseInteraction | PebSliderTogglePlayInteraction) {
    const contentHolderId = interaction.placeholder?.elementId;
    const slider = this.slideHolder[contentHolderId];
    if (!slider?.placeholder) {
      return;
    }

    this.detachAutoPlayer(slider);

    this.store.dispatch(new PebRenderUpdateAction([{
      id: slider.placeholder.id,
      state: {
        slider: {
          playing: this.isPlaying(slider),
        },
      } as PebRenderElementState,
    }]));
  }

  reloadAll() {
    Object.values(this.slideHolder).forEach(slider => this.reloadSlider(slider));
  }

  reloadSlider(slider: SliderModel) {
    slider.content = this.store.selectSnapshot(PebViewState.elements)[slider.content?.id];
    slider.placeholder = this.store.selectSnapshot(PebViewState.elements)[slider.placeholder.id];
    slider.slides = this.getContentSlides(slider.content);
    this.updateViewModels(slider);
  }

  clearAll() {
    Object.values(this.slideHolder).forEach(slider => this.detachAutoPlayer(slider));
    this.slideHolder = {};
  }

  private attachAutoPlayer(slider: SliderModel, action: PebSlidesInteractionBase) {
    if (!slider || isPlatformServer(this.platformId) || this.isPlaying(slider)) {
      return;
    }

    const sliderId = slider.placeholder.id;
    const loop = action.autoPlay.loop;

    this.detachAutoPlayer(slider);
    slider.autoplayIntervalId = setInterval(() => {      
      const targe = this.slideHolder[sliderId];
      if (!targe) {
        return;
      }
      targe.slideIndex = this.getNextSlideNumber(slider, { type: PebIndexChangeType.Next, loop });
      this.updateViewModels(targe);
    }, action.autoPlay.duration);
  }

  private detachAutoPlayer(slider: SliderModel) {
    if (slider?.autoplayIntervalId) {
      clearInterval(slider.autoplayIntervalId);
      slider.autoplayIntervalId = undefined;
    }
  }

  updateViewModels(slider: SliderModel) {
    if (!slider.content) {
      return;
    }

    const selectedSlide = slider.slides[slider.slideIndex];

    const wrapperUpdate: PebRenderUpdateModel = {
      id: `${slider.placeholder.id}-wrapper`,
      type: PebElementType.Shape,
      name: `${slider.placeholder.id}-wrapper`,
      parent: { id: slider.placeholder.id },
      style: {
        host: getSlidesWrapperCssStyle(slider.interaction.align),
      },
    };

    const contentUpdate: PebRenderUpdateModel = {
      id: slider.content.id,
      parent: { id: wrapperUpdate.id },
      style: {
        host: getSlidesContentCssStyle(slider.interaction, selectedSlide),
      },
    };

    const placeholderUpdate: PebRenderUpdateModel = {
      id: slider.placeholder.id,
      state: {
        slider: {
          contentElementId: slider.content?.id,
          slideIndex: slider.slideIndex,
          slidesCount: slider.slides?.length ?? 0,
          playing: !!slider.autoplayIntervalId,
        },
      },
    };

    this.store.dispatch(new PebRenderUpdateAction([
      wrapperUpdate,
      contentUpdate,
      placeholderUpdate,
    ]));

    this.store.dispatch(new PebViewSlideUpdatedAction(
      slider.placeholder.id,
      slider.slideIndex,
      slider.slides.length,
    ));
  }

  private getContentSlides(content: PebRenderElementModel | undefined): PebRenderElementModel[] {
    const slides = [...content?.children ?? []];
    const screenKey = content?.screenKey;
    if (!screenKey) {
      return [];
    }

    slides.sort((elm1, elm2) => {
      const position1 = elm1.defs?.pebStyles[screenKey]?.position;
      const position2 = elm2.defs?.pebStyles[screenKey]?.position;
      const delta1 = (position1?.left?.value ?? 0) + (position1?.top?.value ?? 0);
      const delta2 = (position2?.left?.value ?? 0) + (position2?.top?.value ?? 0);

      return delta1 - delta2;
    });

    return slides;
  }

  private isPlaying(slider: SliderModel): boolean {
    return !!slider?.autoplayIntervalId;
  }

  getNextSlideNumber(slide: SliderModel, slideChange: PebIndexChange | undefined): number {
    return getNextIndex(slide.slideIndex, slideChange, slide.slides.length);
  }
}

interface SliderModel {
  placeholder: PebRenderElementModel;
  content: PebRenderElementModel;
  slides: PebRenderElementModel[];
  slideIndex: number;
  interaction: PebSlidesInteractionBase;
  autoplayIntervalId?: any;
}
