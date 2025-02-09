import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'ivy-iframe',
  templateUrl: './ivy-iframe.component.html',
  styleUrls: ['./ivy-iframe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class IvyIframeComponent {}
