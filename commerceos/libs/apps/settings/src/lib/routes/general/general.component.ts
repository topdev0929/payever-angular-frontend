import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, forkJoin, merge, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessTransferOwnershipService } from '@pe/business';
import { EnvService, PeDestroyService, UserTypeBusinessEnum } from '@pe/common';
import { getLangList, TranslateService, TranslationLoaderService } from '@pe/i18n-core';
import { UserAccountInterface } from '@pe/shared/user';
import { SnackbarService } from '@pe/snackbar';
import { LoadUser, UserLoaded, UserState, PeUser } from '@pe/user';

import { EditSecurityQuestionComponent } from '../../components/edit-security-question/edit-security-question.component';
import { EditShippingComponent } from '../../components/edit-shipping/edit-shipping.component';
import { openLanguageEdit, openPersonalEdit } from '../../misc/constants';
import { ApiService, BusinessEnvService } from '../../services';
import { InfoBoxService } from '../../services/info-box.service';

import {
  EditLanguageComponent,
  EditOwnerComponent,
  EditPasswordComponent,
  EditPersonalInfoComponent,
} from './components';

@Component({
  selector: 'peb-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class GeneralComponent implements OnInit {
  @Select(UserState.user) user$: Observable<UserAccountInterface>;

  personalInformation: UserAccountInterface;

  tfa: boolean;

  openInfoItem$ = new Subject();

  generalsList = [
    {
      logo: '#icon-settings-general-language',
      payload: 'language',
      itemName: this.translateService.translate('info_boxes.panels.general.menu_list.language.title'),
      isActive: false,
      action: (e, detail) => {
        this.openInfoItem$.next();
        detail.isActive = true;
        this.router.navigate(['language'], { relativeTo: this.activatedRoute });
      },
    },
    {
      logo: '#icon-settings-general-personal',
      payload: 'personal',
      itemName: this.translateService.translate('info_boxes.panels.general.menu_list.personal_information.title'),
      isActive: false,
      action: (e, detail) => {
        this.openInfoItem$.next();
        detail.isActive = true;
        this.router.navigate(['personal'], { relativeTo: this.activatedRoute });
      },
    },
    {
      logo: '#icon-settings-general-shipping',
      payload: 'shipping',
      itemName: this.translateService.translate('info_boxes.panels.general.menu_list.shipping_address.title'),
      isActive: false,
      action: (e, detail) => {
        this.openInfoItem$.next();
        detail.isActive = true;
        this.infoBoxService.openModal(
          this.infoBoxService.getObjectForModal(detail, EditShippingComponent, {
            user: this.personalInformation,
          }),
          this.onShippingInfoChange,
          () => this.resetHighlighted(),
        );
      },
    },
    {
      logo: '#icon-settings-general-password',
      payload: 'password',
      itemName: this.translateService.translate('info_boxes.panels.general.menu_list.password.title'),
      isActive: false,
      action: (e, detail) => {
        this.openInfoItem$.next();
        detail.isActive = true;
        this.apiService
          .getTwoFactorSettings()
          .pipe(takeUntil(merge(this.openInfoItem$, this.destroy$)))
          .subscribe((tfa) => {
            this.tfa = tfa;
            this.infoBoxService.openModal(
              this.infoBoxService.getObjectForModal(detail, EditPasswordComponent, { tfa }),
              this.onPasswordChange,
              () => this.resetHighlighted(),
            );
          });
      },
    },
    ...this.isShowTransferOwnership
      ? [
          {
            logo: '#icon-settings-wallpaper',
            payload: 'wallpaper',
            itemName: this.translateService.translate('info_boxes.panels.general.menu_list.ownership.title'),
            isActive: false,
            action: (e, detail) => {
              this.openInfoItem$.next();
              detail.isActive = true;
              this.infoBoxService.openModal(
                this.infoBoxService.getObjectForModal(detail, EditOwnerComponent, {}),
                this.onChangeOwner,
                () => this.resetHighlighted(),
              );
            },
          },
        ]
      : [],
    {
      logo: '#icon-settings-general-security-question',
      payload: 'questions',
      itemName: this.translateService.translate('info_boxes.panels.general.menu_list.security_question.title'),
      isActive: false,
      action: (e, detail) => {
        this.openInfoItem$.next();
        detail.isActive = true;
        forkJoin([
          this.apiService.getSecurityQuestions(),
          this.authService.userSecurityQuestion().pipe(
            map(resp => resp?.question),
            catchError(() => of('')),
          ),
        ])
          .pipe(
            tap(([securityQuestions, selectedQuestion]) => {
              this.infoBoxService.openModal(
                this.infoBoxService.getObjectForModal(detail, EditSecurityQuestionComponent, {
                  securityQuestions,
                  selectedQuestion,
                }),
                () => {},
                () => this.resetHighlighted(),
              );
            }),
            takeUntil(merge(this.openInfoItem$, this.destroy$)),
          )
          .subscribe();
      },
    },
  ];

  listDataSubject = new BehaviorSubject(this.generalsList);

  resetHighlighted() {
    this.generalsList.forEach((item) => {
      item.isActive = false;
    });
    this.listDataSubject.next(this.generalsList);
  }

  get isShowTransferOwnership() {
    return (
      !this.cosEnvService.isPersonalMode &&
      [UserTypeBusinessEnum.Owner, UserTypeBusinessEnum.EmployeeAdmin].includes(
        this.envService.businessAccessOptions.userTypeBusiness,
      )
    );
  }

  constructor(
    private translateService: TranslateService,
    private infoBoxService: InfoBoxService,
    private apiService: ApiService,
    @Inject(EnvService) private envService: BusinessEnvService,
    private cosEnvService: CosEnvService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translationLoaderService: TranslationLoaderService,
    private authService: PeAuthService,
    private store: Store,
    private readonly destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
    private businessTransferOwnershipService: BusinessTransferOwnershipService,
  ) {}

  ngOnInit(): void {
    const routeParams$ = this.activatedRoute.params.pipe(
      filter(res => !!res.modal),
      switchMap(res =>
        this.user$.pipe(
          tap((user) => {
            this.openModal(res.modal, user);
          }),
        ),
      ),
    );

    const routeQueryParams$ = this.activatedRoute.queryParams.pipe(
      switchMap(res => res.transferOwnership ? this.transferOwnership(res.transferOwnership) : of(null)),
    );

    merge(
      this.user$.pipe(tap(user => this.personalInformation = user)),
      this.openInfoItem$.pipe(tap(() => this.resetHighlighted())),
      routeParams$,
      routeQueryParams$,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private openModal(modal, user) {
    switch (modal) {
      case openPersonalEdit: {
        this.generalsList.find(item => item.payload === 'personal').isActive = true;
        this.listDataSubject.next(this.generalsList);
        this.infoBoxService.openModal(
          this.infoBoxService.getObjectForModal(
            {
              itemName: this.translateService.translate(
                'info_boxes.panels.general.menu_list.personal_information.title',
              ),
            },
            EditPersonalInfoComponent,
            { user },
          ),
          this.onPersonalInfoChange,
          () => {
            this.resetHighlighted();
            this.router.navigate(['..'], { relativeTo: this.activatedRoute });
          },
        );
        break;
      }
      case openLanguageEdit: {
        this.generalsList.find(item => item.payload === 'language').isActive = true;
        this.listDataSubject.next(this.generalsList);
        this.infoBoxService.openModal(
          this.infoBoxService.getObjectForModal(
            { itemName: this.translateService.translate('info_boxes.panels.general.menu_list.language.title') },
            EditLanguageComponent,
            {
              businessId: this.envService.businessUuid || this.envService.businessData._id,
              languages: this.getLanguages(),
              language: user.language,
            },
          ),
          this.onLanguageChange,
          () => {
            this.resetHighlighted();
            this.router.navigate(['..'], { relativeTo: this.activatedRoute });
          },
        );
        break;
      }
    }
  }

  transferOwnership(token: string): Observable<void> {
    this.resetHighlighted();

    return this.businessTransferOwnershipService
      .transferOwnership(token)
      .pipe(tap(() => this.router.navigate(['switcher'])));
  }

  getUserData() {
    this.store.dispatch(new LoadUser());
  }

  private getLanguages(): any {
    const languages = getLangList();

    return Object.keys(languages).map((language) => {
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

    const businessId = this.envService.businessId || this.envService.businessData._id;

    this.translationLoaderService
      .reloadTranslations(newData.language)
      .pipe(
        tap(() => {
          const redirectUrl = this.cosEnvService.isPersonalMode
            ? [`personal/${this.envService.userUuid}/settings/general`]
            : [`business/${businessId}/settings/general`];

          const shouldReuseRoute = this.router.routeReuseStrategy.shouldReuseRoute;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate(redirectUrl).then((res) => {
            this.router.routeReuseStrategy.shouldReuseRoute = shouldReuseRoute;
            this.router.onSameUrlNavigation = 'ignore';

            const updatedUser = {
              ...this.personalInformation,
              ...newData,
            } as PeUser;

            this.store.dispatch(new UserLoaded(updatedUser));
          });
          this.infoBoxService.closeSettings(this.infoBoxService.isCloseSettings);
        }),
        catchError((e) => {
          this.router.navigate(['..'], { relativeTo: this.activatedRoute });

          return of(null);
        }),
      )
      .subscribe();
  };

  onPasswordChange = (data) => {
    if (data.tfa !== this.tfa) {
      this.apiService
        .setTwoFactorSettings(data.tfa)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          this.tfa = res.secondFactorRequired;
        });
    }
  };

  onPersonalInfoChange = () => {
    this.getUserData();
    this.infoBoxService.closeSettings(this.infoBoxService.isCloseSettings);
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  };

  onShippingInfoChange = (data) => {
    this.apiService
      .updateUserAccount({ shippingAddresses: data.data })
      .pipe(
        tap(() => this.getUserData()),
        takeUntil(this.destroy$),
      )
      .subscribe();
  };

  onChangeOwner = (data) => {
    this.apiService
      .sendOwnershipInvite(this.envService.businessData._id, data)
      .pipe(
        tap(() => {
          this.snackbarService.toggle(true, {
            content: this.translateService.translate('info_boxes.panels.general.menu_list.ownership.success'),
            duration: 2500,
            iconId: 'icon-commerceos-success',
            iconSize: 24,
          });
        }),
        catchError((error) => {
          this.snackbarService.toggle(true, {
            content: error.error.errors,
            duration: 2500,
            iconId: 'icon-alert-24',
            iconSize: 24,
          });

          return throwError(error);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  };
}
