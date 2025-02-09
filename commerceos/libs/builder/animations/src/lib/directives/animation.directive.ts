import { AnimationPlayer } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import {
  PebAnimation,
  PebAnimationFillMode,
  PebViewElementEventType,
  PebRenderElementModel,
  hasAnimationBinding,
  PebAnimationScrollBinding,
  PebAnimationScrollTarget,
  isSSRContainer,
  PebElementType,
} from '@pe/builder/core';
import { calculateScrollBoundValue } from '@pe/builder/render-utils';
import { PebViewPageScrollAction, PebViewPageScrollReadyAction } from '@pe/builder/view-actions';

import { PebAnimationService } from '../services';


@Directive({
  selector: '[pebAnimation]',
})
export class PebAnimationDirective implements OnChanges, AfterViewInit, OnDestroy {
  private setupDone = false;
  private scrollPlay!: ScrollPlayInfo;
  private animations: { [event: string]: PebAnimation } = {};
  private element!: PebRenderElementModel;

  destroy$ = new Subject<void>();

  @Input() set pebAnimation(val: PebRenderElementModel) {
    this.element = val;

    if (this.setupDone || !val.animations) {
      return;
    }

    Object.values(val.animations)
      .filter(anim => anim.trigger !== PebViewElementEventType.None && hasAnimationBinding(anim))
      .forEach(anim => anim.trigger && (this.animations[anim.trigger] = anim));

    const initAnimation = this.animations[PebViewElementEventType.Init];
    this.playAnimation(initAnimation);

    this.setupDone = true;
  };

  @HostListener('click')
  click() {
    this.playAnimation(this.animations[PebViewElementEventType.Click]);
  }

  @HostListener('mouseenter')
  mouseenter() {
    this.playAnimation(this.animations[PebViewElementEventType.MouseEnter]);
  }

  @HostListener('mouseleave')
  mouseleave() {
    this.playAnimation(this.animations[PebViewElementEventType.MouseLeave]);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef<HTMLElement>,
    private readonly actions$: Actions,
    private animationService: PebAnimationService,  
  ) { }

  ngAfterViewInit(): void {
    if (isSSRContainer(this.element.container)) {
      return;
    }
    const scrollAnimation = this.animations[PebViewElementEventType.PageScroll];
    if (scrollAnimation) {
      this.actions$.pipe(
        ofActionDispatched(PebViewPageScrollReadyAction),
        tap(() => this.setupScrollAnimation(scrollAnimation)),
        takeUntil(this.destroy$),
        take(1),
      ).subscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const pre: PebRenderElementModel = changes.pebAnimation.previousValue;
    const curr: PebRenderElementModel = changes.pebAnimation.currentValue;

    if (curr.state?.animation?.id !== pre?.state?.animation?.id) {
      this.playAnimation(curr.state?.animation);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupScrollAnimation(animation: PebAnimation) {
    const binding = animation.scrollBinding ?? { target: PebAnimationScrollTarget.Page };
    const meta = this.animationService.convertToAnimationMetadata(animation);
    const player = this.animationService.createAnimationPlayer(this.elementRef.nativeElement, meta);
    const targetElement = this.getScrollBindingTarget(binding.target);
    this.scrollPlay = {
      player,
      binding,
      position: targetElement
        ? this.getTargetPosition(targetElement)
        : { top: 0, height: 0 },
      targetElement,
    };

    this.scrollPlay.player.pause();
    this.scrollPlay.player.setPosition(0);

    this.actions$.pipe(
      ofActionDispatched(PebViewPageScrollAction),
      tap((action: PebViewPageScrollAction) => {

        const scrollTop = action.event.top;
        const position = this.scrollPlay.targetElement
          ? this.scrollPlay.position
          : { top: 0, height: action.event.height };

        const percent = calculateScrollBoundValue(
          scrollTop,
          position,
          this.scrollPlay.binding.start,
          this.scrollPlay.binding.end,
        );

        this.scrollPlay.player.setPosition(percent);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private playAnimation(animation: PebAnimation | undefined) {
    if (!animation) {
      return;
    }

    let fill = animation.fill;
    if (fill === PebAnimationFillMode.Auto) {
      fill = animation.trigger === PebViewElementEventType.ViewportEnter
        ? PebAnimationFillMode.Both
        : PebAnimationFillMode.Forwards;
    }

    this.animationService.playAnimation(this.elementRef.nativeElement, { ...animation, fill });
  }

  private getScrollBindingTarget(target: PebAnimationScrollTarget): HTMLElement | undefined {
    if (target === PebAnimationScrollTarget.Page) {
      return undefined;
    }

    if (target === PebAnimationScrollTarget.Section) {
      let parent = this.elementRef.nativeElement.parentElement;
      while (parent) {
        if (parent.getAttribute('peb-type') === PebElementType.Section) {
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    if (target === PebAnimationScrollTarget.Element) {
      return this.elementRef.nativeElement;
    }

    return undefined;
  }

  private getTargetPosition(elm: HTMLElement): { top: number; height: number } {
    let top = elm.offsetTop - (this.document.defaultView?.innerHeight ?? 0);
    let height = elm.offsetHeight;

    let parent = elm.parentElement;
    while (parent) {
      top += parent.offsetTop;
      parent = parent.parentElement;
    }

    return { top, height };
  }
}

interface ScrollPlayInfo {
  player: AnimationPlayer;
  binding: PebAnimationScrollBinding;
  targetElement?: HTMLElement;
  position: { top: number, height: number };
}