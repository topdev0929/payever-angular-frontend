import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';

import { pebGenerateId } from '@pe/builder/core';

@Component({
  selector: 'peb-svg-fill',
  templateUrl: './svg-fill.component.html',
  styleUrls: ['./svg-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSvgFillComponent implements OnChanges {

  @Input() height = 24;
  @Input() width = 24;
  @Input() url = '';
  @Input() scale = 1;
  @Input() tile = false;

  pattern = `pattern_${pebGenerateId()}`;

  changeData$ = new BehaviorSubject(true);

  svgText$ = this.changeData$.pipe(
    map(() => this.url),
    distinctUntilChanged(),
    switchMap(url =>
      from(fetch(url)).pipe(switchMap(response => response.text())),
    ),
    map((html) => {
      const parser = new DOMParser();
      const svg = parser.parseFromString(html, 'image/svg+xml');
      svg.documentElement.removeAttribute('width');
      svg.documentElement.removeAttribute('height');

      return svg.documentElement.outerHTML;
    }),
    catchError(() => {
      return '';
    }),
    shareReplay(1),
  );

  ngOnChanges(): void {
    this.changeData$.next(true);
  }

}
