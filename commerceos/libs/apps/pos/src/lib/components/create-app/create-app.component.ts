import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { cloneDeep, isEqual, pick } from 'lodash-es';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { EnvService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PebShopContainer } from '@pe/resources/shared';

import { PosApi, PosEnvService, TerminalInterface } from '../../services';

@Component({
  selector: 'peb-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsCreateAppComponent {
  posId: string;
  readonly errorMsg$ = new BehaviorSubject<string>(null);
  isImageLoading: boolean;

  posConfig = {
    logo: '',
    name: '',
  };

  private readonly errorMessage = {
    409: this.translateService.translate('pos-app.settings.error_msg.name_already_used'),
  };

  constructor(
    private apiPos: PosApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    @Inject(EnvService) private env: PosEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private translateService: TranslateService,
  ) {

    if (this.appData._id) {
      const data: any = pick(this.appData, ['name', 'logo']);
      this.config.doneBtnTitle = 'Open';
      this.posConfig = cloneDeep(data);
      this.posId = this.appData._id;
      this.config.doneBtnCallback = () => {
        let paylod: any = {};

        if (!isEqual(this.posConfig, data)) {
          paylod = { ...paylod, ... this.posConfig };
        }

        if (!this.errorMsg$.value) {
          if (!paylod?.name) {
            this.appData.active ?
              this.openDashboard(this.appData) :
              this.apiPos.markAsDefault(this.appData._id).subscribe((terminal: TerminalInterface) => {
                this.openDashboard(terminal);
              });
          } else {
            this.apiPos.update(this.appData._id, paylod).pipe(
              switchMap((terminal: TerminalInterface) => {
                this.appData.onSaved$.next({ updatePosList: true });

                return this.appData.active ?
                  of(this.openDashboard(terminal)) :
                  this.apiPos.markAsDefault(this.appData._id)
                    .pipe(tap((terminalData) => {
                      this.openDashboard(terminalData);
                    }));
              }),
            ).subscribe(() => { }, (error) => {
              this.errorMsg$.next(error.error.errors);
            });
          }
        }
      };

      return;
    }

    this.config.doneBtnTitle = 'Create';
    this.config.doneBtnCallback = () => {
      const payload: { logo: string, name: string } = this.posConfig;
      if (!this.errorMsg$.value) {
        this.apiPos.create(payload).pipe(
          switchMap((data: any) => {
            this.appData._id = data._id;

            return this.apiPos.markAsDefault(data._id);
          }),
          tap((data: TerminalInterface) => {
            this.openDashboard(data);
          }),
        ).subscribe({
          error: (err) => {
            if (!err) { return; }
            const errorText = this.errorMessage[err.status]
              ?? (err.message || this.translateService.translate('pos-app.settings.error_msg.name_incorrect'));

            this.errorMsg$.next(errorText);
          },
        });
      }
    };
  }

  openDashboard(terminal: TerminalInterface) {
    this.env.posId = terminal._id;
    this.appData.onSaved$.next({ terminal, openTerminal: true });
    this.overlay.close();
  }

  validateTerminalName(value) {
    this.posConfig.name = value;
    const errorText = value.length < 3 ?
    this.translateService.translate('pos-app.settings.error_msg.name_invalid') :
    '';
    this.errorMsg$.next(errorText);
    this.onConfigChanged();
  }

  removeTerminal() {
    this.apiPos.delete(this.appData._id).subscribe(() => {
      this.appData.onSaved$.next({ updatePosList: true });
      this.overlay.close();
    });
  }

  onDeleteLogo() {
    this.posConfig.logo = '';
    this.onConfigChanged();
  }

  private onConfigChanged() {
    this.config.doneBtnTitle = this.translateService.translate('pos-app.actions.save')
      || 'Save';
    this.cdr.markForCheck();
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.apiPos.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.posConfig.logo = event?.body?.blobName || reader.result as string;
                this.isImageLoading = false;
                this.onConfigChanged();
                this.cdr.detectChanges();
                break;
              }
              default:
                break;
            }
          }),
        ).subscribe();
      };
    }
  }
}
