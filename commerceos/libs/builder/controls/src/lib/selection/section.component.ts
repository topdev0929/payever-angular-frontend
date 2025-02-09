import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { elementInnerSpace, elementLayoutLines, relativeBBoxSizes } from '@pe/builder/editor-utils';
import { isSection, PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebOptionsState } from '@pe/builder/state';


@Component({
  selector: 'peb-section-borders',
  template: `
    <svg
      xmlns:svg="http://www.w3.org/2000/svg"
      class="container"
      [attr.viewBox]="'0 0 ' + this.width + ' ' + this.height"
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSectionComponent {

  @Select(PebElementsState.visibleElements) private readonly elements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  @Input() height = 0;
  @Input() width = 0;

  screenChanges$ = this.screen$.pipe(
    filter(screen => !!screen),
    distinctUntilChanged((a, b) => a.key === b.key),
  );

  lines$ = combineLatest([this.screenChanges$, this.elements$]).pipe(
    map(([screen, elements]) => {
      if (!elements || !screen) {
        return [];
      }

      const elmScreen = elements.find(elm => elm.screen)?.screen;

      if (elmScreen && elmScreen.key !== screen.key) {
        return [];
      }

      const sections = elements.filter(elm => isSection(elm) && elm.visible);
      const lines = [];
      sections.forEach((section, index) => lines.push(...this.getSectionLines(section, index)));

      return lines;
    }),
  );

  getSectionLines(section: PebElement, index: number): { x1: number, y1: number, x2: number, y2: number }[] {
    const lines = [];
    const [x1, y1, x2, y2] = [section.minX, section.minY, section.maxX, section.maxY];

    const padding = relativeBBoxSizes(section, elementInnerSpace(section));

    const topLine = { x1, y1, x2, y2: y1 };
    const leftPadding = { x1: x1 + padding.left, y1, x2: x1 + padding.left, y2 };
    const rightPadding = { x1: x2 - padding.right, y1, x2: x2 - padding.right, y2 };

    index > 0 && lines.push(topLine);
    padding.left && lines.push(leftPadding);
    padding.right && lines.push(rightPadding);

    lines.push(...elementLayoutLines(section, { outerLines: false }));

    return lines;
  }
}
