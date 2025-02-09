import { Component, OnDestroy } from '@angular/core';

import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'pe-builder-snackbar',
  templateUrl: 'snackbar.component.html',
  styleUrls: ['snackbar.component.scss'],
})
export class SnackbarComponent implements OnDestroy {
  constructor(public snackbarService: SnackbarService) {}

  ngOnDestroy(): void {
    this.snackbarService.message = '';
  }
}
