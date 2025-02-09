import { Injectable } from '@angular/core';

const DEFAULT_SCALE = 1;

@Injectable({
  providedIn: 'root',
})
export class WidgetScaleService {
  private _scale = 1;

  set scale(scale: number) {
    this._scale = scale;
  }

  get scale(): number {
    return this._scale;
  }

  get scaleInCssValue(): string {
    return `scale(${this._scale})`;
  }

  setDefault(): void {
    this.scale = DEFAULT_SCALE;
  }
}
