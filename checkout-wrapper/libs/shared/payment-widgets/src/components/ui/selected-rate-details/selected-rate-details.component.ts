import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Input,
  OnChanges,
  HostBinding,
  ViewChild,
  ViewChildren,
  QueryList,
  Renderer2,
} from '@angular/core';

import { DetailInterface } from '@pe/checkout/types';

import { UIBaseComponent } from '../base.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'finexp-ui-selected-rate-details',
  templateUrl: './selected-rate-details.component.html',
  styleUrls: ['./selected-rate-details.component.scss'],
})
export class UISelectedRateDetailsComponent extends UIBaseComponent implements OnChanges {

  @Input() details: DetailInterface[] = [];

  @ViewChild('grid') gridRef: ElementRef<HTMLDivElement>;

  @ViewChildren('cell') cells: QueryList<ElementRef<HTMLDivElement>>;

  @HostBinding('style.color') regularTextColor: string = null;

  protected debugName = 'UISelectedRateDetailsComponent';

  private renderer = this.injector.get(Renderer2);

  ngOnChanges(): void {
    super.ngOnChanges();
  }

  onResize({ contentRect }: ResizeObserverEntry): void {
    const gridElement: HTMLElement = this.gridRef.nativeElement;
    const cells: ElementRef[] = this.cells.toArray();
    const gap = 16;
    const { width: newWidth } = contentRect;
    const cols: number = this.calculateColumns(cells.length, newWidth);
    const width: number = (newWidth - (cols - 1) * gap) / cols;
    this.renderer.setStyle(gridElement, 'display', 'grid');
    this.renderer.setStyle(gridElement, 'grid-template-columns', `repeat(${cols}, ${width}px)`);
  }

  onUpdateStyles(): void {
    this.regularTextColor = this.currentStyles?.regularTextColor || this.default.styles.regularTextColor;
  }

  private calculateColumns(cellCount: number, newWidth: number): number {
    const widest = Math.max(...this.cells.map(cell => Array.from(cell.nativeElement.children).reduce(
      (acc, item) => acc + item.clientWidth, 0
    )));
    const maxCols = Math.floor(newWidth / widest);
    if (cellCount % 2 === 1) {
      return maxCols;
    }
    const cols = maxCols % 2 === 1 && maxCols > 1 ? maxCols - 1 : maxCols;

    return Math.max(Math.min(cols, this.cells.length), 1);
  }
}
