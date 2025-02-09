import { ChangeDetectionStrategy, Component } from '@angular/core';
import { peVariables } from '../../../../pe-variables';

@Component({
  selector: 'pe-profile-card-spinner',
  styleUrls: ['./profile-spinner.component.scss'],
  templateUrl: './profile-spinner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileSpinnerComponent {
  spinnerDiameter: number = peVariables.toNumber('spinnerStrokeXs');
  spinnerStroke: number = peVariables.toNumber('spinnerStrokeWidth');
}
