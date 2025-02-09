import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebSnapLine } from '@pe/builder/core';
import { PebEditorState, PebOptionsState } from '@pe/builder/state';


@Component({
  selector: 'peb-snap-lines',
  template: `
  <div *ngIf="scale$ | async as scale">
    <div 
      *ngFor="let line of nearestSnapLines$ | async; trackBy: trackByLine" class="snap-line"
      [style.left]="line.minX*scale+'px'"
      [style.top]="line.minY*scale+'px'"
      [style.width]="(line.maxX-line.minX)*scale+'px'"
      [style.height]="(line.maxY-line.minY)*scale+'px'"
      [ngClass]="{applied:line.applied || line.distance === 0}"
    >
     <ng-container *ngIf="line.applied">
        <svg 
          *ngFor="let joint of line.joints" 
          class="joint" 
          stroke="red" 
          stroke-width="0.7" 
          [style.left]="joint.x*scale"
          [style.top]="joint.y*scale"
        >
          <line x1="0" y1="0" x2="100%" y2="100%"  />
          <line x1="0" y1="100%" x2="100%" y2="0"  />
        </svg>
      </ng-container>
    </div>
  </div>
  `,
  styles: [
  `
  :host {
    position: absolute;
    pointer-events: none;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    overflow: visible;
  }

  .snap-line {
    position: absolute;
    box-sizing: border-box;
    border-top: 1px dashed gray;
    border-left: 1px dashed gray;
    opacity: 0.2;
  }

  .snap-line.applied {
    border-top: 1px solid red;
    border-left: 1px solid red;
    opacity: 1;
  }

  .joint {
    position: absolute;
    width:4px;
    height:4px;
    margin-left:-3px;
    margin-top:-3px;
    display: none;
  }

  .snap-line.applied>.joint{
    display: block;
  }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSnapLinesComponent {

  @Input() width = 0;
  @Input() height = 0;

  @Select(PebOptionsState.scale) scale$!: Observable<number>;
  @Select(PebEditorState.snapLines) private readonly snapLines$!: Observable<PebSnapLine[]>;

  private readonly maxSnapLines = 50;

  nearestSnapLines$ = this.snapLines$.pipe(
    map(snapLines => snapLines
      .sort((a, b) => a.distance - b.distance)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, this.maxSnapLines)
    ),
  );

  trackByLine(i: number, item: PebSnapLine): string {
    return `${item.minX}-${item.minY}:${item.maxX}-${item.maxY}`;
  }

}
