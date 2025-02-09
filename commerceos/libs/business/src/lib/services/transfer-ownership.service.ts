import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { TranslateService } from '@pe/i18n-core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { SnackbarService } from '@pe/snackbar';

@Injectable()
export class BusinessTransferOwnershipService {
  constructor(
    private apiService: ApiService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
  ) {}

  transferOwnership(token: string): Observable<void> {
    return this.apiService.transferBusinessOwnership(token).pipe(
      tap(() => {
        this.snackbarService.toggle(true, {
          content: this.translateService.translate('forms.business_transfer_ownership.success_received'),
          duration: 2500,
          iconId: 'icon-commerceos-success',
          iconSize: 24,
        });
      }),
    );
  }
}
