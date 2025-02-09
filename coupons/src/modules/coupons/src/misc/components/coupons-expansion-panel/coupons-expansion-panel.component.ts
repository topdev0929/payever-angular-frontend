import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-coupons-expansion-panel',
  templateUrl: './coupons-expansion-panel.component.html',
  styleUrls: ['./coupons-expansion-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('openClose', [
      state('false', style({ height: '0px' })),
      state('true', style({ height: '*' })),
      transition('true <=> false', [
        animate('300ms cubic-bezier(.4, 0, .2, 1)'),
      ])
    ])
  ]
})
export class PeCouponsExpansionPanelComponent {

  isOpen = true;

  toggle() {
    this.isOpen = !this.isOpen;
  }

}