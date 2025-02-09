import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'peb-campaign-settings',
  templateUrl: './campaign-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./campaign-settings.component.scss']
})
export class PebShopSettingsComponent {

}
