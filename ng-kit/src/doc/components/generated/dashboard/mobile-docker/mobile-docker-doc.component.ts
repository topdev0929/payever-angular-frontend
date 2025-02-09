import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { App, StoreItem, Notification } from '../dashboard-doc.interface';
import { DockerService } from '../services';

@Component({
  selector: 'doc-mobile-docker',
  templateUrl: './mobile-docker-doc.component.html',
  providers: [DockerService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileDockerDocComponent implements OnInit {

  @Input() public appsList: App[];
  @Input() public storesList: StoreItem[];
  @Input() public settingsList: App[];
  @Input() public settings: any[];

  public dashboardType: string;
  public titleTodos: string;
  public titleStores: string;
  public titleShop: string;
  public titleApps: string;
  public titleTalk: string;
  public titleSettings: string;
  public titleCategoryAll: string;
  public titleCategoryRun: string;
  public titleCategoryStart: string;
  public titleCategoryGrow: string;
  public businessCommunicationLink: string;
  public privateAccountLink: string;
  public businessAccountLink: string;
  public helpLink: string;
  public titleNoOffers: string;
  public titleNoNotifications: string;

  @Input() public set apps(apps: App[]) {
    this.setAppsCategories(apps);
  }

  @Input() public notificationsList: Notification[];
  @Input() public set notifications(notifications: Notification[]) {
    this.notificationsList = this.dockerService.getNotifications(notifications);
  }

  public backgroundImage: string;
  @Input() public set background(backgroundImage: string) {
    this.backgroundImage = backgroundImage;
  }

  @Output() mobileDockerOpened: EventEmitter<boolean> = new EventEmitter();

  public dockerApps: App[];
  public startApps: App[];
  public runApps: App[];
  public growApps: App[];

  public isSliderHidden: boolean = true;

  public isMobileDockerContentOpened: boolean = false;
  public isAppsOpened: boolean = false;
  public isTodosOpened: boolean = false;
  public isStoreOpened: boolean = false;
  public isSettingsOpened: boolean = false;

  public currentCategory: string = 'all-category';

  public swiperAll: Swiper;
  public swiperStart: Swiper;
  public swiperRun: Swiper;
  public swiperGrow: Swiper;
  public swiperStore: Swiper;
  public swiperSettings: Swiper;
  public swiperNotification: Swiper;

  @ViewChild('swiperAllContainer') swiperAllContainer: ElementRef;
  @ViewChild('swiperStartContainer') swiperStartContainer: ElementRef;
  @ViewChild('swiperRunContainer') swiperRunContainer: ElementRef;
  @ViewChild('swiperGrowContainer') swiperGrowContainer: ElementRef;
  @ViewChild('swiperStoreContainer') swiperStoreContainer: ElementRef;
  @ViewChild('swiperNotificationContainer', { static: true }) swiperNotificationContainer: ElementRef;
  @ViewChild('swiperSettingsContainer', { static: true }) swiperSettingsContainer: ElementRef;

  constructor(private dockerService: DockerService) {}

  ngOnInit(): void {

    this.dashboardType = this.settings['dashboardType'];
    this.titleTodos = this.settings['titleTodos'];
    this.titleStores = this.settings['titleStores'];
    this.titleShop = this.settings['titleShop'];
    this.titleApps = this.settings['titleApps'];
    this.titleTalk = this.settings['titleTalk'];
    this.titleSettings = this.settings['titleSettings'];
    this.titleCategoryAll = this.settings['titleCategoryAll'];
    this.titleCategoryRun = this.settings['titleCategoryRun'];
    this.titleCategoryStart = this.settings['titleCategoryStart'];
    this.titleCategoryGrow = this.settings['titleCategoryGrow'];
    this.businessCommunicationLink = this.settings['businessCommunicationLink'];
    this.privateAccountLink = this.settings['privateAccountLink'];
    this.businessAccountLink = this.settings['businessAccountLink'];
    this.helpLink = this.settings['helpLink'];
    this.backgroundImage = this.settings['backgroundImage'];
    this.titleNoOffers = this.settings['titleNoOffers'];
    this.titleNoNotifications = this.settings['titleNoNotifications'];

    if (this.dashboardType === 'business') {
      this.setStoreItems();
    }

    this.setAppsCategories(this.appsList);
    this.onSwiperActivation();

    this.notificationsList = this.dockerService.getNotifications(this.notificationsList);

  }

  getStoreApps(storeItems: StoreItem[]): StoreItem[] {
    return storeItems.filter((elem: StoreItem) => {
      return elem.label.indexOf('store') > -1 ||
          elem.label.indexOf('facebook') > -1 ||
          elem.label.indexOf('other_shopsystem') > -1 ||
          elem.label.indexOf('weebly') > -1;
    });
  }

  getDockerApps(apps: App[]): App[] {
    const excludedApps: string[] = [
      'dashboard', 'santander', 'debitoor', 'overlay',
      'e-conomic', 'live_support', 'settings', 'my_stores', 'communication'
    ];
    return apps.filter((elem: App) => {
      return excludedApps.indexOf(elem.label) === -1;
    });
  }

  getStartApps(apps: App[]): App[] {
    return apps.filter((elem: App) => {
      return elem.url.indexOf('pos') > -1;
    });
  }

  getGrowApps(apps: App[]): App[] {
    return apps.filter((elem: App) => {
      return elem.url.indexOf('marketing') > -1 || elem.url.indexOf('adver') > -1 || elem.url.indexOf('market') > -1;
    });
  }

  getRunApps(apps: App[], growApps: App[], startApps: App[]): App[] {
    return apps.filter((elem: App) => {
      return growApps.indexOf(elem) === -1;
    }).filter((elem: App) => {
      return startApps.indexOf(elem) === -1;
    });
  }

  setAppsCategories(apps: App[]): void {
    this.dockerApps = this.getDockerApps(apps);
    this.startApps = this.getStartApps(this.dockerApps);
    this.growApps = this.getGrowApps(this.dockerApps);
    this.runApps = this.getRunApps(this.dockerApps, this.growApps, this.startApps);
  }

  setStoreItems(): void {
    if (this.storesList.length) {
      this.storesList = this.getStoreApps(this.storesList);
    }
  }

  openDockerTodosContent(): void {
    if (this.isMobileDockerContentOpened && this.isTodosOpened && !this.isAppsOpened && !this.isStoreOpened && !this.isSettingsOpened) {
      this.isMobileDockerContentOpened = false;
    } else if (this.isMobileDockerContentOpened && !this.isTodosOpened && (this.isAppsOpened || this.isStoreOpened || this.isSettingsOpened)) {
      this.isMobileDockerContentOpened = true;
    } else {
      this.isMobileDockerContentOpened = !this.isMobileDockerContentOpened;
    }
    this.mobileDockerOpened.emit(this.isMobileDockerContentOpened);
    this.isTodosOpened = true;
    this.isAppsOpened = false;
    this.isStoreOpened = false;
    this.isSettingsOpened = false;
    this.currentCategory = '';
  }

  openDockerAppsContent(): void {
    if (this.isMobileDockerContentOpened && this.isAppsOpened && !this.isTodosOpened && !this.isStoreOpened && !this.isSettingsOpened) {
      this.isMobileDockerContentOpened = false;
    } else if (this.isMobileDockerContentOpened && !this.isAppsOpened && (this.isTodosOpened || this.isStoreOpened || this.isSettingsOpened)) {
      this.isMobileDockerContentOpened = true;
    } else {
      this.isMobileDockerContentOpened = !this.isMobileDockerContentOpened;
    }
    this.mobileDockerOpened.emit(this.isMobileDockerContentOpened);
    this.isAppsOpened = true;
    this.isTodosOpened = false;
    this.isStoreOpened = false;
    this.isSettingsOpened = false;
    if (!this.currentCategory) {
      this.currentCategory = 'all-category';
    }
  }

  openDockerStoreContent(): void {
    if (this.isMobileDockerContentOpened && this.isStoreOpened && !this.isTodosOpened && !this.isAppsOpened && !this.isSettingsOpened) {
      this.isMobileDockerContentOpened = false;
    } else if (this.isMobileDockerContentOpened && !this.isStoreOpened && (this.isTodosOpened || this.isAppsOpened || this.isSettingsOpened)) {
      this.isMobileDockerContentOpened = true;
    } else {
      this.isMobileDockerContentOpened = !this.isMobileDockerContentOpened;
    }
    this.mobileDockerOpened.emit(this.isMobileDockerContentOpened);
    this.isStoreOpened = true;
    this.isAppsOpened = false;
    this.isTodosOpened = false;
    this.isSettingsOpened = false;
    this.currentCategory = '';
  }

  openDockerSettingsContent(): void {

    if (this.isMobileDockerContentOpened && this.isSettingsOpened && !this.isAppsOpened && !this.isTodosOpened && !this.isStoreOpened ) {
      this.isMobileDockerContentOpened = false;
    } else if (this.isMobileDockerContentOpened && !this.isSettingsOpened && (this.isAppsOpened || this.isTodosOpened || this.isStoreOpened )) {
      this.isMobileDockerContentOpened = true;
    } else {
      this.isMobileDockerContentOpened = !this.isMobileDockerContentOpened;
    }
    this.mobileDockerOpened.emit(this.isMobileDockerContentOpened);
    this.isSettingsOpened = true;
    this.isAppsOpened = false;
    this.isTodosOpened = false;
    this.isStoreOpened = false;
    this.currentCategory = '';
  }


  closeDockerContent(): void {
    this.isMobileDockerContentOpened = !this.isMobileDockerContentOpened;
    this.mobileDockerOpened.emit(this.isMobileDockerContentOpened);
    if (!this.isAppsOpened && !this.isTodosOpened && !this.isStoreOpened) {
      this.isAppsOpened = true;
    }
  }

  changeAppCategory(event: MouseEvent): void {
    this.currentCategory = event.target['id'];
  }

  swiperActivation(swiperContainer: ElementRef): void {
    let swiperConfig: SwiperOptions;
    switch (swiperContainer) {
      case this.swiperAllContainer:
        swiperConfig = this.dockerService.createAppsSwiperConfig();
        this.swiperAll = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
      case this.swiperStartContainer:
        swiperConfig = this.dockerService.createAppsSwiperConfig();
        this.swiperStart = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
      case this.swiperRunContainer:
        swiperConfig = this.dockerService.createAppsSwiperConfig();
        this.swiperRun = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
      case this.swiperGrowContainer:
        swiperConfig = this.dockerService.createAppsSwiperConfig();
        this.swiperGrow = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
      case this.swiperStoreContainer:
        swiperConfig = this.dockerService.createAppsSwiperConfig();
        this.swiperStore = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
      case this.swiperSettingsContainer:
        swiperConfig = this.dockerService.createSettingsSwiperConfig();
        this.swiperSettings = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
      default:
        swiperConfig = this.dockerService.createMobileNotifySwiperConfig();
        this.swiperNotification = new Swiper(swiperContainer.nativeElement, swiperConfig);
        break;
    }
    this.isSliderHidden = false;
  }

  switchToApp(dockerApp: App): void {

  }

  onSwiperActivation(): void {
    setTimeout(() => {
      if (this.dashboardType === 'business') {
        this.swiperActivation(this.swiperAllContainer);
        this.swiperActivation(this.swiperStartContainer);
        this.swiperActivation(this.swiperRunContainer);
        this.swiperActivation(this.swiperGrowContainer);
        this.swiperActivation(this.swiperStoreContainer);
        this.swiperActivation(this.swiperNotificationContainer);
        this.swiperActivation(this.swiperSettingsContainer);
      }
      if (this.dashboardType === 'private') {
        this.swiperActivation(this.swiperAllContainer);
        this.swiperActivation(this.swiperNotificationContainer);
      }
    });
  }
}
