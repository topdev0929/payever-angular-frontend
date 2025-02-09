import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';

import { PeAppointmentsHeaderService } from '../services';

@Component({
  selector: 'cos-appointments-root',
  templateUrl: './appointments-root.component.html',
  styleUrls: ['./appointments-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class CosAppointmentsRootComponent implements OnInit, OnDestroy {

  constructor(
    private peAppointmentsHeaderService: PeAppointmentsHeaderService,
  ) { }

  ngOnDestroy(): void {
    this.peAppointmentsHeaderService.destroy();
  }

  ngOnInit(): void {
    this.peAppointmentsHeaderService.initialize();
  }
}
