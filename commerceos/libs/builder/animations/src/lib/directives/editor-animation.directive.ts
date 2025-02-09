import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebRenderElementModel } from '@pe/builder/core';
import { PebViewAnimationPreviewAction } from '@pe/builder/view-actions';

import { PebAnimationService } from '../services';


@Directive({
  selector: '[pebEditorAnimation]',
})
export class PebEditorAnimationDirective implements OnDestroy {
  private elementId!: string;

  destroy$ = new Subject<void>();

  @Input() set pebEditorAnimation(val: PebRenderElementModel) {
    this.elementId = val.id;
  };

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private readonly actions$: Actions,
    private animationService: PebAnimationService,
  ) {
    this.actions$.pipe(
      ofActionDispatched(PebViewAnimationPreviewAction),
      tap((action: PebViewAnimationPreviewAction) => {
        if (action.elementId === this.elementId) {
          this.animationService.previewAnimation(this.elementRef.nativeElement, action.animation);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
