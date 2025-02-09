import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Data, Router } from '@angular/router';
import { AppThemeEnum, MessageBus } from '@pe/common';
import { getLangList, TranslateService, TranslationLoaderService } from '@pe/i18n-core';
import { filter, pluck, takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '../../components/abstract';
import { CloseWindowsConfirmationComponent } from '../../components/dialogs/exit-confirm/exit-confirm.component';
import { EditLanguageComponent } from '../../components/edit-language/edit-language.component';
import { EditPasswordComponent } from '../../components/edit-password/edit-password.component';
import { EditPersonalInfoComponent } from '../../components/edit-personal-info/edit-personal-info.component';
import { EditShippingComponent } from '../../components/edit-shipping/edit-shipping.component';
import { EditStyleComponent } from '../../components/edit-style/edit-style.component';
import { closeConfirmationQueryParam, openLanguageEdit, openPersonalEdit } from '../../index';
import { BusinessInterface } from '../../misc/interfaces';
import { ApiService, BusinessEnvService, PlatformService } from '../../services';
import { InfoBoxService } from '../../services/info-box.service';

@Component({
  selector: 'peb-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GeneralComponent extends AbstractComponent implements OnInit {
  personalInformation: any;
  tfa: boolean;
  isCloseSettings = false;
  business: BusinessInterface;
  theme = this.envService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  generalsList = [{
    logo: '#icon-settings-general-language',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.language.title'),
    action: (e, detail) => {
      this.apiService.getUserAccount().pipe(takeUntil(this.destroyed$))
        .subscribe(res => {
          this.infoBoxService.openModal(
            this.infoBoxService.getObjectForModal(
              detail,
              EditLanguageComponent,
              {
                languages: this.getLanguages(),
                language: res?.language,
              },
            ), this.theme, this.onLanguageChange,
          );
        });
    },
  }, {
    logo: '#icon-settings-general-styles',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.color_and_style.title'),
    action: (e, detail) => {
      this.infoBoxService.openModal(
        this.infoBoxService.getObjectForModal(
          detail,
          EditStyleComponent,
          { themeSettings: this.business?.themeSettings },
        ), this.theme, this.onColorAndStyleChange,
      );
    },
  }, {
    logo: '#icon-settings-general-personal',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.personal_information.title'),
    action: (e, detail) => {
      this.infoBoxService.openModal(
        this.infoBoxService.getObjectForModal(
          detail,
          EditPersonalInfoComponent,
          {
            user: this.personalInformation,
          },
        ), this.theme, this.onPersonalInfoChange,
      );
    },
  }, {
    logo: '#icon-settings-general-shipping',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.shipping_address.title'),
    action: (e, detail) => {
      this.infoBoxService.openModal(
        this.infoBoxService.getObjectForModal(
          detail,
          EditShippingComponent,
          {
            user: this.personalInformation,
          },
        ), this.theme, this.onShippingInfoChange,
      );
    },
  }, {
    logo: '#icon-settings-general-password',
    itemName: this.translateService.translate('info_boxes.panels.general.menu_list.password.title'),
    action: (e, detail) => {
      this.apiService.getTwoFactorSettings().pipe(takeUntil(this.destroyed$))
        .subscribe(tfa => {
          this.tfa = tfa;
          this.infoBoxService.openModal(
            this.infoBoxService.getObjectForModal(
              detail,
              EditPasswordComponent,
              { tfa },
            ), this.theme, this.onPasswordChange,
          );
        });
    },
  }];
  constructor(
    private translateService: TranslateService,
    private infoBoxService: InfoBoxService,
    private apiService: ApiService,
    private envService: BusinessEnvService,
    private dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private platformService: PlatformService,
    private translationLoaderService: TranslationLoaderService,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.pipe(
    pluck(closeConfirmationQueryParam),
    filter(showDialog => !!showDialog),
    takeUntil(this.destroyed$),
      ).subscribe( () => {
        this.showConfirmationDialog('test');
      });

    this.activatedRoute.data
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: Data) => {
        this.business = data['business'];
        this.personalInformation = data['user'];
        this.cdr.detectChanges();
      });

    this.activatedRoute.params.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(
      res => {
        switch (res.modal) {
          case openPersonalEdit: {
            this.isCloseSettings = true;
            this.apiService.getUserAccount().pipe(takeUntil(this.destroyed$))
              .subscribe(result => {
                this.infoBoxService.openModal(
                  this.infoBoxService.getObjectForModal(
                    {name: this.translateService.translate('info_boxes.panels.general.menu_list.personal_information.title')},
                    EditPersonalInfoComponent,
                    {
                      user: result,
                    },
                  ), this.theme, this.onPersonalInfoChange,
                );
              });
            break;
          }
          case openLanguageEdit: {
            this.isCloseSettings = true;
            this.apiService.getUserAccount().pipe(takeUntil(this.destroyed$))
              .subscribe(result => {
                this.infoBoxService.openModal(
                  this.infoBoxService.getObjectForModal(
                    {name: this.translateService.translate('info_boxes.panels.general.menu_list.language.title')},
                    EditLanguageComponent,
                    {
                      languages: this.getLanguages(),
                      language: result.language,
                    },
                  ), this.theme, this.onLanguageChange,
                );
              });
            break;
          }
        }
      },
    );
  }

  getUserData() {
    this.apiService.getUserAccount().pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.personalInformation = res;
      });
  }

  showConfirmationDialog(data) {
    const dialogRef = this.dialog.open(CloseWindowsConfirmationComponent, {
      panelClass: [ 'settings-dialog', this.theme],
      data,
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result.exit) {
          this.infoBoxService.dialogRef.close();
        }
        this.router.navigate(['.'], {relativeTo: this.activatedRoute});
        if (result.exit) {
          this.closeSettings();
        }
      });
  }

  private getLanguages(): any {
    const languages = getLangList();

    return Object.keys(languages).map(language => {
      return {
        value: language,
        label: languages[language].name,
      };
    });
  }

  onLanguageChange = (language) => {
    const newData = {
      language,
    };
    this.apiService.updateUserAccount(newData).pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        if (this.business._id) {
          this.apiService.updateBusinessData(this.business._id, {defaultLanguage: newData.language})
            .pipe(takeUntil(this.destroyed$))
            .subscribe();
        }

        return this.translationLoaderService.reloadTranslations(newData.language).subscribe(() => {
          const currentUrl = this.router.url;
          const shouldReuseRoute = this.router.routeReuseStrategy.shouldReuseRoute;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate([currentUrl]).then(res => {
            this.router.routeReuseStrategy.shouldReuseRoute = shouldReuseRoute;
            this.router.onSameUrlNavigation = 'ignore';
          });
          this.closeSettings();
        }, error => {
        });
      }, () => {
      });
  }

  onColorAndStyleChange = (data) => {
    const newData: any = {
      _id: data.style.id,
      primaryColor: data.style.primaryColor,
      secondaryColor: data.style.secondaryColor,
    };

    this.apiService.updateBusinessData(this.envService.businessUuid, { themeSettings: newData }).pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
     this.business = res;
      });
  }

  onPasswordChange = (data) => {
    if (data.tfa !== this.tfa) {
      this.apiService.setTwoFactorSettings(data.tfa).pipe(takeUntil(this.destroyed$))
        .subscribe((res: any) => {
        this.tfa = res.secondFactorRequired;
        });
    }
  }

  onPersonalInfoChange = (data) => {
        this.apiService.updateUserAccount(data)
          .subscribe((result) => {
            this.getUserData();
            this.closeSettings();
          });
  }

  onShippingInfoChange = (data) => {
    this.apiService.updateUserAccount({ shippingAddresses: data.data }).pipe(takeUntil(this.destroyed$))
      .subscribe(res => {
        this.getUserData();
      });
  }

  closeSettings() {
    if (this.isCloseSettings) {
      this.messageBus.emit('settings.close.app', '');
    }
  }
}
