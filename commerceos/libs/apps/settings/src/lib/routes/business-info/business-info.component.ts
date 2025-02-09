import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, Store, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { of, from, merge } from 'rxjs';
import { catchError, debounceTime, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import {
  BusinessInterface as StateBusinessInterface,
} from '@pe/business';
import { MessageBus, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { SnackbarService } from '@pe/snackbar';
import {
  BusinessDataLoaded,
  BusinessState,
  LoadBusinessFailed,
  LoadBusinesses,
  ResetBusinessState,
  UpdateBusinessData,
} from '@pe/user';

import { settingsBusinessIdRouteParam } from '../../misc/constants';
import { getUniqueId } from '../../misc/helpers/unique-id-counter.helper';
import { BusinessInterface, ProfileMenuEventInterface } from '../../misc/interfaces';
import { ApiService, PlatformService } from '../../services';
import { ImagesUploaderService } from '../../services/images-uploader.service';
import { SettingsRoutesEnum } from '../../settings-routes.enum';

@Component({
  selector: 'peb-business-info',
  templateUrl: './business-info.component.html',
  styleUrls: ['./business-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class BusinessInfoComponent implements OnInit {
  @SelectSnapshot(BusinessState.businessData) currentBusiness: BusinessInterface;

  form: FormGroup;
  businessId: string;
  filename: string;
  hasLogoError: boolean = false;

  loading$ = merge(
    this.actions$.pipe(
      ofActionDispatched(UpdateBusinessData),
    ).pipe(map(() => true)),
    this.actions$.pipe(
      ofActionCompleted(BusinessDataLoaded, LoadBusinessFailed),
    ).pipe(map(() => false)),
  );


  readonly uniqueId: string = `settings-edit-business-logo-${getUniqueId()}`;
  private readonly nameMaxLength: number = 40;
  private currentPageLink: string;

  set homeUrl(businessId: string) {
    this.currentPageLink = `business/${businessId}/settings/${SettingsRoutesEnum.Info}`;
  }

  get homeUrl(): string {
    return this.currentPageLink;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private platformService: PlatformService,
    private translateService: TranslateService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private authService: PeAuthService,
    private imageUpload: ImagesUploaderService,
    private mediaService: MediaService,
    private store: Store,
    private actions$: Actions,
    private messageBus: MessageBus,
    private readonly destroy$: PeDestroyService,
    private confirmScreenService: ConfirmScreenService,
    private snackbarService: SnackbarService
  ) {
  }

  ngOnInit() {
    this.businessId = this.activatedRoute.parent.snapshot.params[settingsBusinessIdRouteParam];
    this.homeUrl = this.businessId;

    this.form = this.formBuilder.group({
      logo: null,
      name: [null, [Validators.maxLength(this.nameMaxLength)]],
    });

    this.activatedRoute.parent.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.businessId = params[settingsBusinessIdRouteParam] || params['slug'];
        this.homeUrl = this.businessId;
      });

    this.notifyAboutChanges(this.currentBusiness);

    this.form.valueChanges.pipe(
      debounceTime(1000),
      switchMap(value => this.store.dispatch(new UpdateBusinessData(this.currentBusiness._id, value)).pipe(
        map(() => this.store.selectSnapshot(BusinessState.businessData)),
      )),
      catchError(() => of(this.currentBusiness)),
      tap((updatedBusiness) => {
        const activeBusiness = this.authService.refreshLoginData.activeBusiness;
        if (activeBusiness?.name) {
          activeBusiness.name = updatedBusiness.name;
          activeBusiness.placeholderTitle = updatedBusiness.name;
          activeBusiness.logo = [updatedBusiness.logo];
          this.authService.refreshLoginData = {
            activeBusiness,
          };
        }
        this.notifyAboutChanges(updatedBusiness as BusinessInterface);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  goBack() {
    this.router.navigateByUrl(this.homeUrl);
  }

  onDeleteBusiness() {
    this.showConfirmationDialog();
  }

  uploadImage($event) {
    const [file] = $event.target.files;
    if (!file) {
      return;
    }

    this.imageUpload.uploadImages([file]).subscribe((res: any) => {
      if (res.type === 'data') {
        this.filename = res.data.lastUploadedImage.originalName;
        this.form.controls.logo.patchValue(res.data.uploadedImages[0].url);
        this.messageBus.emit('settings.change.logo', res.data.uploadedImages[0].url);
        this.hasLogoError = false;
        this.cdr.detectChanges();
      }
    }, (err) => {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate(err.error.message),
        duration: 2500,
        iconId: 'icon-alert-24',
        iconSize: 24,
      });
      this.hasLogoError = true;
    });
  }

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.form.controls.logo.value, 'images');
  }

  private notifyAboutChanges(newBusiness: BusinessInterface) {
    const logo = newBusiness?.logo ?? null;
    const name = newBusiness?.name ?? '';
    const currentFormValue = { logo, name } as ProfileMenuEventInterface;

    this.form.patchValue(currentFormValue, { emitEvent: false, onlySelf: true });
    this.platformService.profileMenuChanged = currentFormValue;
    this.cdr.detectChanges();
  }

  private showConfirmationDialog() {
    const headings: Headings = {
      confirmBtnText: this.translateService.translate('dialogs.business_delete.confirm'),
      declineBtnText: this.translateService.translate('dialogs.business_delete.decline'),
      subtitle: this.translateService.translate('dialogs.business_delete.label'),
      title: this.translateService.translate('dialogs.business_delete.title'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      take(1),
      switchMap((result) => {

        if (result) {
          return this.apiService.deleteBusiness(this.businessId).pipe(
            tap(() => {
              localStorage.removeItem('pe_active_business');
              this.store.dispatch(new ResetBusinessState());
              this.store.dispatch(new LoadBusinesses());
              this.router.navigateByUrl('/switcher');

              const state: { businesses: StateBusinessInterface[], total: number } = this.store.selectSnapshot(BusinessState.businesses);

              if (state.total === 0) {
                localStorage.removeItem('pe_active_business');
              }
              if (state.total === 1 && state.businesses[0]) {
                localStorage.setItem('pe_active_business', JSON.stringify(state.businesses[0]));
              }
            }),
          );
        }

        return from(this.router.navigate([], { relativeTo: this.activatedRoute }));
      }),
    ).subscribe();
  }
}
