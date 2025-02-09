import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { cloneDeep, isEqual, pick } from 'lodash';

import { PebEditorApi } from '@pe/builder-api';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PebShopContainer } from '@pe/builder-core';
import { EnvService, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PosClientTerminalService } from '@pe/builder-pos-client';

import { PosEnvService } from '../../services/pos/pos-env.service';
import { PosApi } from '../../services/pos/abstract.pos.api';
import { TerminalInterface } from '../../services/pos.types';

@Component({
  selector: 'peb-create-app',
  templateUrl: './create-app.component.html',
  styleUrls: ['./create-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSettingsCreateAppComponent implements OnInit {
  posId: string;
  errorMsg: string;
  isImageLoading: boolean;

  posConfig = {
    logo: '',
    name: '',
  };

  constructor(
    private apiPos: PosApi,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
    private overlay: PeOverlayWidgetService,
    @Inject(EnvService) private env: PosEnvService,
    private cdr: ChangeDetectorRef,
    private api: PebEditorApi,
    private destroy$: PeDestroyService,
    private translateService: TranslateService,
    private terminalService: PosClientTerminalService,
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

        if (!this.errorMsg) {
          if (!paylod?.name) {
            this.appData.active ?
              this.openDashboard(this.appData) :
              this.apiPos.markPosAsDefault(this.appData._id).subscribe((terminal: TerminalInterface) => {
                this.openDashboard(terminal);
                this.terminalService.terminal = terminal;
              });
          } else {
            this.apiPos.updatePos(this.appData._id, paylod).pipe(
              switchMap((terminal: TerminalInterface) => {
                this.appData.onSved$.next({ updatePosList: true });
                return this.appData.active ?
                  of(this.openDashboard(terminal)) :
                  this.apiPos.markPosAsDefault(this.appData._id)
                    .pipe(tap((terminalData) => {
                      this.openDashboard(terminalData);
                      this.terminalService.terminal = terminalData;
                    }));
              }),
            ).subscribe(() => { }, (error) => {
              this.errorMsg = error.error.errors;
              this.cdr.markForCheck();
            });
          }
        }
      };
      return;
    }
    this.config.doneBtnTitle = 'Create';
    this.config.doneBtnCallback = () => {
      const payload: { logo: string, name: string } = this.posConfig;
      if (!this.errorMsg) {
        this.apiPos.createPos(payload).pipe(
          switchMap((data: any) => {
            this.appData._id = data._id;
            return this.apiPos.markPosAsDefault(data._id).pipe(
              tap((terminal: TerminalInterface) => this.terminalService.terminal = terminal),
            );
          }),
          tap((data: TerminalInterface) => {
            this.openDashboard(data);
          }),
        ).subscribe({
          error: () => {
            this.errorMsg = this.translateService.translate('pos-app.settings.error_msg.name_incorrect');
            this.cdr.markForCheck();
          },
        });
      }
    };
  }

  ngOnInit() {
  }

  openDashboard(terminal: TerminalInterface) {
    this.env.posId = terminal._id;
    this.appData.onSved$.next({ terminal, openTerminal: true });
    this.overlay.close();
  }

  validateTerminalName(value) {
    this.posConfig.name = value;
    this.errorMsg = value.length < 3 ?
      this.translateService.translate('pos-app.settings.error_msg.name_invalid') :
      '';
    this.cdr.markForCheck();
    return;
    /* this.apiPos.validatePosName(value).subscribe(data => {
      this.errorMsg = data.message ? data.message : null;
      this.cdr.markForCheck();
    }) */
  }

  /*  validateName(name: string) {
     return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(name);
   } */

  removeTerminal() {
    this.apiPos.deletePos(this.appData._id).subscribe(() => {
      this.appData.onSved$.next({ updatePosList: true });
      this.overlay.close();
    });
  }

  onLogoUpload($event: any) {
    this.isImageLoading = true;
    const files = $event;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        this.api.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          takeUntil(this.destroy$),
          tap((event) => {
            switch (event.type) {
              case HttpEventType.UploadProgress: {
                this.cdr.detectChanges();
                break;
              }
              case HttpEventType.Response: {
                this.posConfig.logo = (event?.body?.blobName || reader.result as string);
                this.isImageLoading = false;
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
