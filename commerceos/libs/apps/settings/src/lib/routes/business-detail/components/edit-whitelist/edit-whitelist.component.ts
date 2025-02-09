import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { BehaviorSubject, merge, Observable, timer } from 'rxjs';
import { skip, take, takeUntil, tap, map } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { PePickerComponent } from '@pe/ui';
import { PeUser, UserState } from '@pe/user';

import { DOMAIN_PATTERN } from '../../../../misc/constants';
import { ApiService, BusinessEnvService, FormTranslationsService } from '../../../../services';



enum LinkTypeEnum {
  Login = 'login',
  Registration = 'registration',
}

interface ButtonsCopyLinkInterface {
  text: string;
  url: string;
  type: LinkTypeEnum;
}

type StateLinkCopy = {
  [key in LinkTypeEnum]: boolean;
}

const DEFAULT_SOURCE = 'employees';
const SOURCE_SETTINGS = {
  business: DEFAULT_SOURCE,
};

@Component({
  selector: 'peb-edit-contact',
  templateUrl: './edit-whitelist.component.html',
  styleUrls: ['./edit-whitelist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class EditWhitelistComponent implements OnInit {
  @Select(UserState.user) user$: Observable<PeUser>;

  @ViewChild('picker') domainPicker: PePickerComponent;

  currentDomain: string;
  whitelistForm: FormGroup;
  incorrectDomain = false;
  sameDomain = false;
  currentDomains = [];
  stateLinkCopy: StateLinkCopy = {
    login: false,
    registration: false,
  };

  buttonsCopyLink$: Observable<ButtonsCopyLinkInterface[]>;

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    public formTranslationsService: FormTranslationsService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private peOverlayRef: PeOverlayRef,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private businessEnvService: BusinessEnvService,
    private readonly destroyed$: PeDestroyService,
  ) { }

  ngOnInit(): void {
    this.formTranslationsService.formTranslationNamespace = 'form.create_form';
    this.currentDomains = this.overlayData.data.domains.map(data => ({ value: data.domain, label: data.domain }));

    this.whitelistForm = this.formBuilder.group({
      domains: [[...this.currentDomains]],
    });

    this.overlaySaveSubject.pipe(
      skip(1),
      tap(() => this.onCheckValidity()),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.buttonsCopyLink$ = this.user$.pipe(
      map((user) => {
        return this.prepareButtonsCopyLink(user?.registrationOrigin?.source);
      })
    );
  }

  onCheckValidity() {
    if (this.whitelistForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    const domainsToDelete =
      this.currentDomains.filter(domain => !this.whitelistForm.value.domains.includes(domain));
    const domainsToAdd =
      this.whitelistForm.value.domains.filter(domain => !this.currentDomains.includes(domain));

    if (domainsToAdd.length === 0 && domainsToDelete.length === 0) {
      this.peOverlayRef.close();

      return;
    }

    const addDomains$ = domainsToAdd.map(domain => this.apiService.updateBusinessTrustedDomains(
      this.businessEnvService.businessId,
      domain.value,
    ));

    const deleteDomains$ = domainsToDelete.map(domain => this.apiService.deleteBusinessTrustedDomains(
      this.businessEnvService.businessId,
      domain.value,
    ));

    merge(
      ...addDomains$,
      ...deleteDomains$,
    ).pipe(
      tap(() => this.peOverlayRef.close()),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  addDomain = () => {
    const isUniqueDomain = !this.whitelistForm.value.domains?.find(
      domain => domain.value?.toLowerCase() === this.currentDomain?.toLowerCase()
    );

    if (DOMAIN_PATTERN.test(this.currentDomain) && isUniqueDomain) {
      this.domainPicker.onAddItem({ label: this.currentDomain, value: this.currentDomain });
      this.currentDomain = null;
    }

    this.incorrectDomain = this.currentDomain && !DOMAIN_PATTERN.test(this.currentDomain) && isUniqueDomain;
    this.sameDomain = this.currentDomain && !isUniqueDomain;
  }

  onKeyUpPicker(e: string) {
    this.currentDomain = e;
  }

  get domainErrorMessage() {
    if (this.incorrectDomain) {
      return this.formTranslationsService.getFormControlErrorMessage('whitelist');
    }
    if (this.sameDomain) {
      return this.translateService.translate('form.create_form.errors.domain_not_unique');
    }

    return null;
  }

  copyLink(type: string): void {
    if (!this.stateLinkCopy[type]) {
      this.stateLinkCopy[type] = true;

      this.snackbarService.toggle(true, {
        content: this.translateService.translate('form.create_form.whitelist.copied'),
        iconId: 'icon-commerceos-success',
        duration: 2000,
        iconColor: '#00B640',
      });

      timer(500).pipe(
        take(1),
        tap(() => {
          this.stateLinkCopy[type] = false;
        }),
      ).subscribe();
    }
  }

  private prepareButtonsCopyLink(source = DEFAULT_SOURCE) {
    if (SOURCE_SETTINGS[source]) {
      source = SOURCE_SETTINGS[source];
    }

    const registrationUrlSegment = source === DEFAULT_SOURCE ? DEFAULT_SOURCE : `${source}/employees`;

    return [
      {
        text: this.translateService.translate('form.create_form.whitelist.copy_login'),
        url: `${this.env.frontend.commerceos}/login/${source}/${this.businessEnvService.businessId}`,
        type: LinkTypeEnum.Login,
      },
      {
        text: this.translateService.translate('form.create_form.whitelist.copy_registration'),
        url: `${this.env.frontend.commerceos}/registration/${registrationUrlSegment}/${this.businessEnvService.businessId}`,
        type: LinkTypeEnum.Registration,
      },
    ];
  }
}
