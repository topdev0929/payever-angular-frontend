import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, ReplaySubject, combineLatest } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { pebColorToCss } from '@pe/builder/color-utils';
import { PebSBoxShadow } from '@pe/builder/core';
import { calculateShadowOffset, getBoxShadowCss, PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebColorForm } from '../color';

@Component({
  selector: 'peb-shadow-form',
  templateUrl: './shadow-form.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './shadow-form.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebShadowForm implements OnInit {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  submit$ = new BehaviorSubject<boolean>(false);
  shadowColor$ = new ReplaySubject<string>(1);
  shadowEnable$ = new BehaviorSubject<boolean>(false);

  shadowForm = this.formBuilder.group({
    hasShadow: [true],
    color: [],
    offset: [0],
    blur: [0, [Validators.min(0), Validators.max(100)]],
    opacity: [0, [Validators.min(0), Validators.max(100)]],
    angle: [0, [Validators.min(0), Validators.max(360)]],
  });

  defaultShadow: PebSBoxShadow = {
    hasShadow: false,
    blur: 5,
    color: { r: 0, g: 0, b: 0 },
    offset: 10,
    opacity: 100,
    angle: 315,
  };

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly sideBarService: PebSideBarService,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store,
  ) {
  }

  ngOnInit(): void {
    this.selectedElements$.pipe(
      filter(elements => !!elements?.length),
      tap(([element]) => {
        const shadow = element.styles.shadow || this.defaultShadow;

        this.shadowForm.markAsPristine();
        this.shadowForm.patchValue(shadow);
        this.shadowColor$.next(pebColorToCss(shadow.color));
        this.shadowEnable$.next(shadow.hasShadow);
      }),
      switchMap((elements) => {
        return combineLatest([this.shadowForm.valueChanges, this.submit$]).pipe(
          filter(() => this.shadowForm.dirty),
          tap(([value, submit]) => {
            const shadow = {
              ...value,
              ...calculateShadowOffset(value.offset, value.angle),
            };

            if (submit) {
              const payload = elements.map(element => ({ id: element.id, styles: { shadow } }));
              this.store.dispatch(new PebUpdateAction(payload));
              this.submit$.next(false);
            } else {
              const payload = elements.map(element => ({ id: element.id, style: { filter: getBoxShadowCss(shadow) } }));
              this.store.dispatch(new PebViewPatchAction(payload));
            }

            this.shadowColor$.next(typeof value.color === 'string' ? value.color : pebColorToCss(value.color));
            this.shadowEnable$.next(shadow.hasShadow);
          }),
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  showShadowColorForm() {
    const colorForm = this.sideBarService.openDetail(
      PebColorForm,
      { backTitle: 'Style', title: 'Shadow Color' },
    );

    colorForm.instance.formControl = this.shadowForm.get('color') as FormControl;
    colorForm.instance.blurred.pipe(
      tap(() => {
        this.shadowColor$.next(pebColorToCss(this.shadowForm.value.color));
        this.submit$.next(true);
      }),
      takeUntil(colorForm.instance.destroy$),
    ).subscribe();
  }

  onSubmit() {
    this.submit$.next(true);
  }

}
