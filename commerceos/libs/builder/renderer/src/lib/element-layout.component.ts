import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable, ReplaySubject } from 'rxjs';
import { filter, map, takeUntil, withLatestFrom } from 'rxjs/operators';

import { PebEditorLine, PebElementType, PebViewElement, PebViewStyle } from '@pe/builder/core';
import { bboxDimension, elementLayoutLines } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-element-layout',
  template: `
    <svg
      xmlns:svg="http://www.w3.org/2000/svg"
      class="container"
      [attr.viewBox]="'0 0 ' + this.width + ' ' + this.height"
      [attr.width]="this.width"
      [attr.height]="this.height"
    >
      <svg:line
        class="line"
        *ngFor="let line of lines$ | async"
        [attr.x1]="line.x1"
        [attr.y1]="line.y1"
        [attr.x2]="line.x2"
        [attr.y2]="line.y2"
        stroke="#777777"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  `,
  styles: [
    `:host {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }

    .container {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .line {
      vector-effect: non-scaling-stroke !important;
      stroke-width: 1px;
      stroke-dasharray: 3 3;
    }`,
  ],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebElementLayoutComponent implements OnInit, OnChanges {
  @Select(PebElementsState.visibleElements) private readonly elements$!: Observable<PebElement[]>;

  @Input() def!: PebViewElement<PebViewStyle>;

  height = 0;
  width = 0;

  lines$: Observable<PebEditorLine[]>;
  private def$ = new ReplaySubject<PebViewElement<PebViewStyle>>(1);

  constructor(private readonly destroy$: PeDestroyService) { }

  ngOnInit(): void {
    this.lines$ = this.def$.pipe(
      filter(def => !!def.layout && def.type !== PebElementType.Section),
      withLatestFrom(this.elements$),
      map(([def, elements]) => elements.find(elm => elm.id === def.id)),
      filter(element => !!element),
      map(element => this.getElementLines(element)),
      takeUntil(this.destroy$),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.def?.currentValue) {
      this.def$.next(changes.def.currentValue);
    }
  }

  private getElementLines(element: PebElement): { x1: number, y1: number, x2: number, y2: number }[] {
    const dimension = bboxDimension(element);

    this.width = dimension.width;
    this.height = dimension.height;

    const lines = elementLayoutLines(element, { outerLines: false });

    lines.forEach((line) => {
      line.x1 -= element.minX;
      line.x2 -= element.minX;
      line.y1 -= element.minY;
      line.y2 -= element.minY;
    });

    return lines;
  }

}
