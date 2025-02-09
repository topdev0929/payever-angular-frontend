import {
  AnimationBuilder,
  AnimationStyleMetadata,
  animate as angularAnimate,
  keyframes as angularKeyframes,
  style as angularStyles,
  AnimationPlayer,
  AnimationAnimateMetadata,
  query as angularQuery,
  AnimationMetadata,
  AnimationGroupMetadata,
  group as angularGroup,
} from '@angular/animations';
import { Injectable } from '@angular/core';
import produce from 'immer';
import { Subject, timer } from 'rxjs';
import { finalize, shareReplay, take, takeUntil, tap } from 'rxjs/operators';

import {
  PebAnimationKeyframe,
  PebAnimation,
  PenAnimationPropertyValueType,
  PebAnimationFillMode,
  PebAnimationTiming,
  PebAnimationProperty,
  PebCss,
  PebAnimationDirection,
} from '@pe/builder/core';
import { SELF, propertiesToQueryStyles, propertyResolvers } from '@pe/builder/render-utils';

@Injectable()
export class PebAnimationService {
  private readonly destroy$ = new Subject<void>();

  private withFillEnd = [PebAnimationFillMode.Forwards, PebAnimationFillMode.Both];

  constructor(
    private readonly animationBuilder: AnimationBuilder,
  ) { }

  stopAnimation(): void {
    this.destroy$.next();
  }

  previewAnimation(element: HTMLElement, animation: PebAnimation) {
    const animationMetadata = this.convertToAnimationMetadata(animation);
    const player = this.createAnimationPlayer(element, animationMetadata);
    player.onDone(() => player.destroy());
    player.play();
  }

  playAnimation(element: HTMLElement, animation: PebAnimation): AnimationPlayer {
    this.applyAnimationFillModeStart(animation, element);

    const animationMetadata = this.convertToAnimationMetadata(animation);
    const player = this.createAnimationPlayer(element, animationMetadata);
    const iteration = animation.iteration ? animation.iteration : 1;

    const timer$ = timer(animation.delay ?? 0, animation.duration + (animation.delay ?? 0));
    const plays$ = animation.infiniteLoop
      ? timer$
      : timer$.pipe(take(iteration + 1));

    plays$.pipe(
      tap(() => {
        player.setPosition(0);
        player.play();
      }),
      finalize(() => {
        if (animation.fill && this.withFillEnd.includes(animation.fill)) {
          player.setPosition(1);
          player.pause();
        } else {
          player.destroy();
        }
      }),
      shareReplay(),
      takeUntil(this.destroy$),
    ).subscribe();

    return player;
  }

  createAnimationPlayer(
    element: HTMLElement,
    animationMetadata: AnimationMetadata,
  ): AnimationPlayer {
    return this.animationBuilder.build(animationMetadata).create(element);
  }

  convertToAnimationMetadata(animation: PebAnimation): AnimationGroupMetadata {
    const group: { [query: string]: PebAnimationKeyframe[] } = {};
    const keyframes = this.getKeyframes(animation);

    for (const keyframe of keyframes) {
      const queryKeyframes: { [query: string]: PebAnimationKeyframe } = {};

      for (const prop of keyframe.properties ?? []) {
        const resolver = propertyResolvers[prop.key];
        if (!resolver) {
          continue;
        }
        const query = resolver.query ?? SELF;
        const queryKeyframe = queryKeyframes[query] ?? (queryKeyframes[query] = { ...keyframe, properties: [] });
        queryKeyframe.properties.push(prop);
      };

      Object.keys(queryKeyframes).forEach((query) => {
        const item = group[query] ?? (group[query] = []);
        item.push(queryKeyframes[query]);
      });
    }

    const result: AnimationMetadata[] = [];

    Object.keys(group).forEach((query: string) => {
      result.push(angularQuery(
        query,
        this.getAnimateMetadata(animation.duration, animation.timing, group[query]),
        { optional: true, delay: 0 },
      ));
    });

    return angularGroup(result);
  }

  private getAnimateMetadata(
    duration: number,
    timing?: PebAnimationTiming,
    keyframes?: PebAnimationKeyframe[],
  ): AnimationAnimateMetadata {
    return angularAnimate(
      `${duration}ms ${timing}`,
      angularKeyframes((keyframes ?? []).map(kf => this.convertToStyleMetadata(kf))),
    );
  }

  private convertToStyleMetadata(keyframe?: PebAnimationKeyframe): AnimationStyleMetadata {
    if (!keyframe?.properties) {
      return angularStyles({});
    }

    const styles = this.propertiesToCssStyles(keyframe?.properties);

    return angularStyles({ ...styles as any, offset: keyframe.offset / 100 });
  }

  public applyAnimationFillModeStart(animation: PebAnimation, htmlElement: HTMLElement,) {
    const keyframe = animation?.keyframes?.find(kf => kf.offset === 0);
    keyframe && this.applyAnimationKeyframeStyles(htmlElement, keyframe);
  }

  private applyAnimationFillModeEnd(htmlElement: HTMLElement, animation: PebAnimation) {
    const keyframe = animation?.keyframes?.find(kf => kf.offset === 100);
    keyframe && this.applyAnimationKeyframeStyles(htmlElement, keyframe);
  }

  private applyAnimationKeyframeStyles(element: HTMLElement, keyframe: PebAnimationKeyframe) {
    const queryStyles = propertiesToQueryStyles(keyframe.properties);

    if (!queryStyles) {
      return;
    }

    Object.keys(queryStyles).forEach(query => this.applyCssStyles(element, query, queryStyles[query]));
  }

  private applyCssStyles(element: HTMLElement, query: string, styles: Partial<CSSStyleDeclaration>) {
    const toApply = !query || query === SELF
      ? [element]
      : element.querySelectorAll(query) as NodeListOf<HTMLElement>;

    for (const key in styles) {
      toApply.forEach(elm => elm.style[key] = styles[key] ?? '');
    }
  }


  private propertiesToCssStyles(properties: PebAnimationProperty[] | undefined): Partial<CSSStyleDeclaration> {
    if (!properties?.length) {
      return {};
    }

    let styles: PebCss = {};

    properties.forEach(({ key, value }) => {
      const resolver = propertyResolvers[key];
      if (resolver?.style) {
        const newStyles = resolver.style(value);

        if (styles.transform && newStyles.transform) {
          newStyles.transform = `${styles.transform} ${newStyles.transform}`;
        }

        styles = { ...styles, ...newStyles };
      }
    });

    return styles;
  }

  private getKeyframes(animation: PebAnimation): PebAnimationKeyframe[] {
    const sortedKeyframes = [...animation.keyframes ?? []];
    sortedKeyframes?.sort((a, b) => a.offset - b.offset);

    if (animation.direction === PebAnimationDirection.Reverse) {
      return produce(sortedKeyframes, (draft) => {
        draft.reverse();

        for (let i = 0; i < sortedKeyframes.length; i++) {
          draft[i].offset = sortedKeyframes[i].offset;
        }

        return draft;
      });
    }

    return sortedKeyframes;
  }
}
export interface PropertyResolver {
  query?: string;
  style: (val: PenAnimationPropertyValueType) => { [key: string]: string }
}

