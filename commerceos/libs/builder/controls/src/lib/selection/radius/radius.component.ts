import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebControlAnchorType } from '../controls';

import { PebRadiusService } from './radius.service';


@Component({
  selector: 'peb-radius',
  templateUrl: './radius.component.html',
  styleUrls: ['./radius.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeRadiusComponent {

  @Input() width = 0;
  @Input() height = 0;

  type = PebControlAnchorType;
  data$ = this.radiusService.controlsData$;

  constructor(
    private readonly radiusService: PebRadiusService,
  ) {
  }
}

