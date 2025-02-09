import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-customer-privacy',
  templateUrl: './customer-privacy.component.html',
  styleUrls: ['./customer-privacy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSettingsCustomerPrivacyComponent {
  toggleValue = false;
}
