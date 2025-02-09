import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { EMPTY } from 'rxjs';

import { Widget, WidgetData, WidgetType } from '@pe/widgets';
import { AppThemeEnum, EnvService } from '@pe/common';
import { PeOverlayRef, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { ContactsGQLService, SearchOverlayService } from '../../services';
import { ContactMainInfo, ContactResponse, ContactTypesEnum, StatusField } from '../../interfaces';
import { getContactDisplayFields } from '../../utils/contacts';
import { AbstractComponent } from '../../misc/abstract.component';

const DEFAULT_WIDGET: Widget = {
  _id: '',
  type: WidgetType.Icons,
  appName: '',
  title: '',
  data: [],
  installedApp: true,
  setupStatus: 'completed',
  showInstallAppButton: false,
  defaultApp: true,
  installed: true,
  onInstallAppClick: (): any => {
  }
};

@Component({
  selector: 'contacts-widget',
  templateUrl: './contacts-widget.component.html',
  styleUrls: ['./contacts-widget.component.scss'],
})
export class ContactsWidgetComponent extends AbstractComponent implements OnInit, OnDestroy {

  @ViewChild('statusTrigger') statusTrigger: MatMenuTrigger;
  contactStatus = 'No status';
  contactData: ContactResponse = null;
  contactInfo: ContactMainInfo = null;
  contactId = this.overlayData.contactId;

  socialIconsWidget: Widget;
  transactionsWidget: Widget;
  shopWidget: Widget;
  productsWidget: Widget;
  contactsWidget: Widget;
  adsWidget: Widget;
  statuses: StatusField[] = [];
  isLoading = false;

  socialIconsWidgetData: WidgetData[];

  get theme(): AppThemeEnum {
    return AppThemeEnum[this.envService.businessData?.themeSettings?.theme] || AppThemeEnum.default;
  }

  constructor(
    private contactsGQLService: ContactsGQLService,
    private envService: EnvService,
    private cdr: ChangeDetectorRef,
    private searchOverlay: SearchOverlayService,
    @Inject(PeOverlayRef) public dialogRef: PeOverlayRef,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.contactsGQLService.getContactById(this.contactId)
      .pipe(
        takeUntil(this.destroyed$),
        tap(() => this.isLoading = false),
        finalize(() => this.isLoading = false)
      )
      .subscribe((contact: ContactResponse) => {
        this.setUpWidgets(contact);
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  openStatusMenu(): void {
    if (this.statuses?.length) {
      this.statusTrigger.openMenu();
    }
  }

  selectStatus(status: StatusField): void {
    this.contactStatus = status.name;
  }

  private setUpWidgets(contactRes: ContactResponse): void {
    const contact: ContactMainInfo = getContactDisplayFields(contactRes);
    console.log(contactRes);
    console.log(contact);
    this.contactInfo = contact;
    const isBusinessProfile = contactRes.type === ContactTypesEnum.Company;
    this.socialIconsWidgetData = [
      {
        title: 'Call',
        icon: '#call-widget-icon',
      },
      {
        title: 'Mail',
        icon: '#mail-widget-icon',
      },
      {
        title: 'WhatsApp',
        icon: '#whats-app-widget-icon',
      },
      {
        title: 'Twitter',
        icon: '#twitter-widget-icon',
      },
      {
        title: 'Instagram',
        icon: '#instagram-widget-icon',
      },
    ];
    this.socialIconsWidget = {
      ...DEFAULT_WIDGET,
      _id: 'socialWidget',
      icon: '#icon-commerceos-apps',
      type: WidgetType.Icons,
      title: `Message`,
      data: this.socialIconsWidgetData,
      openButtonLabel: 'Edit',
      openButtonFn: () => {
        this.openEditAppsBox();
        return EMPTY;
      },
    };
    this.transactionsWidget = {
      ...DEFAULT_WIDGET,
      _id: 'socialWidget',
      type: WidgetType.Text,
      icon: '#icon-commerceos-transactions',
      appName: 'transactions',
      title: 'transactions',
      installIconUrl: 'icon-comerceos-transactions-not-installed.png',
      openButtonLabel: 'Open',
      openButtonFn: () => {
        this.openEditAppsBox();
        return EMPTY;
      },
      data: [
        {
          title: '230,550.79 €',
        },
        {
          title: 'This month',
        },
        {
          title: '+435.65',
          titleColor: 'green',
        },
      ],
    };

    this.productsWidget = {
      ...DEFAULT_WIDGET,
      _id: 'productWidget',
      type: WidgetType.Grid,
      appName: 'products',
      icon: '#icon-commerceos-products',
      title: 'products',
      subTitle: 'widgets.products.actions.add-new',
      installIconUrl: 'icon-comerceos-product-not-installed.png',
      openButtonLabel: 'Open',
      openButtonFn: () => {
        this.openEditAppsBox();
        return EMPTY;
      },
    };
    this.contactData = contactRes;
    this.cdr.detectChanges();
  }

  goEditContactPage(): void {
    this.dialogRef.close(this.contactData);
  }

  goGroupForm(): void {
  }

  goSearch(): void {
    this.searchOverlay.open();
  }

  openEditAppsBox(): void {
    console.log('test');
  }
}
