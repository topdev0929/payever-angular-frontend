import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'finish-container-style',
  template: '',
  styles: [`
    #swedbank-pay-seamless-view-page {
      height: fit-content;
    }
  `],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinishContainerStyleComponent {}
