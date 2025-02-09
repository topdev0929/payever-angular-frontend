import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { App, StoreItem, Notification, DashboardSettings } from '../dashboard-doc.interface';
import { DockerService } from '../services';

@Component({
  selector: 'doc-desktop-docker',
  templateUrl: './desktop-docker-doc.component.html',
  providers: [DockerService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesktopDockerDocComponent implements OnInit {

  @Input() public appsList: App[];
  @Input() public storesList: StoreItem[];
  @Input() public settingsList: App[];
  @Input() public settings: DashboardSettings;

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
  titleHelp: string;

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

  public isDockerInitialized: boolean;
  @Input() public set initialization(initialization: boolean) {
    this.isDockerInitialized = initialization;
  }

  @Output() public appSwitch: EventEmitter<any> = new EventEmitter();
  @Output() public dockerOpened: EventEmitter<any> = new EventEmitter();

  public isDockerClose: boolean = false;
  public isDockerContentOpened: boolean = false;
  public isAppsOpened: boolean = false;
  public isSettingsOpened: boolean = false;
  public isTodosOpened: boolean = false;
  public isStoreOpened: boolean = false;
  public isArrowLooksUp: boolean = true;
  public isArrowLooksDown: boolean = false;
  public isArrowHovered: boolean = false;
  public currentCategory: string = 'all-category';

  public dockerApps: App[];
  public startApps: App[];
  public runApps: App[];
  public growApps: App[];

  public swiper: Swiper;

  public isSliderHidden: boolean = true;

  @ViewChild('swiperContainer', { static: true }) public swiperContainer: ElementRef;
  @ViewChild('arrowLeft', { static: true }) public arrowLeft: ElementRef;
  @ViewChild('arrowRight', { static: true }) public arrowRight: ElementRef;

  constructor(private dockerService: DockerService) {}

  ngOnInit(): void {

    this.dashboardType = this.settings['dashboardType'];
    this.isDockerInitialized = this.settings['isDockerInitialized'];
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
    this.titleHelp = this.settings.titleHelp;

    if (this.dashboardType === 'business') {
      this.setStoreItems();
    }

    this.setAppsCategories(this.appsList);
    setTimeout(() => this.swiperActivation());

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

  swiperActivation(): void {
    const rightArrow: ElementRef = this.arrowRight;
    const leftArrow: ElementRef = this.arrowLeft;
    const swiperConfig: SwiperOptions = this.dockerService.createNotifySwiperConfig(rightArrow, leftArrow);
    this.swiper = new Swiper(this.swiperContainer.nativeElement, swiperConfig);
    this.isSliderHidden = false;
  }

  openDockerTodosContent(): void {
    if (this.isDockerContentOpened && this.isTodosOpened && !this.isAppsOpened && !this.isStoreOpened && !this.isSettingsOpened) {
      this.isDockerContentOpened = false;
      this.isArrowHovered = false;
    } else if (this.isDockerContentOpened && !this.isTodosOpened && (this.isAppsOpened || this.isStoreOpened || this.isSettingsOpened)) {
      this.isDockerContentOpened = true;
    } else {
      this.isDockerContentOpened = !this.isDockerContentOpened;
      this.isArrowHovered = false;
    }
    this.dockerOpened.emit(this.isDockerContentOpened);
    this.isTodosOpened = true;
    this.isAppsOpened = false;
    this.isStoreOpened = false;
    this.isSettingsOpened = false;
  }

  openDockerAppsContent(): void {
    if (this.isDockerContentOpened && this.isAppsOpened && !this.isTodosOpened && !this.isStoreOpened && !this.isSettingsOpened) {
      this.isDockerContentOpened = false;
      this.isArrowHovered = false;
    } else if (this.isDockerContentOpened && !this.isAppsOpened && (this.isTodosOpened || this.isStoreOpened || this.isSettingsOpened)) {
      this.isDockerContentOpened = true;
    } else {
      this.isDockerContentOpened = !this.isDockerContentOpened;
      this.isArrowHovered = false;
    }
    this.dockerOpened.emit(this.isDockerContentOpened);
    this.isAppsOpened = true;
    this.isTodosOpened = false;
    this.isStoreOpened = false;
    this.isSettingsOpened = false;
  }

  openDockerStoreContent(): void {
    if (this.isDockerContentOpened && this.isStoreOpened && !this.isTodosOpened && !this.isAppsOpened && !this.isSettingsOpened) {
      this.isDockerContentOpened = false;
      this.isArrowHovered = false;
    } else if (this.isDockerContentOpened && !this.isStoreOpened && (this.isTodosOpened || this.isAppsOpened || this.isSettingsOpened)) {
      this.isDockerContentOpened = true;
    } else {
      this.isDockerContentOpened = !this.isDockerContentOpened;
      this.isArrowHovered = false;
    }
    this.dockerOpened.emit(this.isDockerContentOpened);
    this.isStoreOpened = true;
    this.isSettingsOpened = false;
    this.isAppsOpened = false;
    this.isTodosOpened = false;
  }

  openDockerSettingsContent(): void {
    if (this.isDockerContentOpened && this.isSettingsOpened && !this.isTodosOpened && !this.isStoreOpened && !this.isAppsOpened) {
      this.isDockerContentOpened = false;
      this.isArrowHovered = false;
      this.isSettingsOpened = false;

    } else if (this.isDockerContentOpened && !this.isSettingsOpened && (this.isTodosOpened || this.isStoreOpened || this.isAppsOpened)) {
      this.isDockerContentOpened = true;
      this.isSettingsOpened = true;
    } else {
      this.isDockerContentOpened = !this.isDockerContentOpened;
      this.isArrowHovered = false;
      this.isSettingsOpened = true;
    }
    this.dockerOpened.emit(this.isDockerContentOpened);
    this.isAppsOpened = false;
    this.isTodosOpened = false;
    this.isStoreOpened = false;
  }

  closeDockerContent(): void {
    this.isDockerContentOpened = !this.isDockerContentOpened;
    this.isArrowHovered = false;
    this.isArrowLooksUp = false;
    this.isArrowLooksDown = false;
    this.dockerOpened.emit(this.isDockerContentOpened);
    if (!this.isAppsOpened && !this.isTodosOpened && !this.isStoreOpened) {
      this.isAppsOpened = true;
    }
    this.isSettingsOpened = false;
  }

  changeAppCategory(event: MouseEvent): void {
    this.currentCategory = event.target['id'];
  }

  switchToApp(): void {
    this.isDockerClose = true;
    this.appSwitch.emit(true);
  }

  animateArrowOnHover(): void {
    this.isArrowHovered = true;
    if (this.isDockerContentOpened) {
      this.isArrowLooksDown = true;
      this.isArrowLooksUp = false;
    } else {
      this.isArrowLooksUp = true;
      this.isArrowLooksDown = false;
    }
  }

  animateArrowOnLeave(): void {
    this.isArrowHovered = false;
    if (this.isDockerContentOpened) {
      this.isArrowLooksDown = true;
      this.isArrowLooksUp = false;
    } else {
      this.isArrowLooksUp = true;
      this.isArrowLooksDown = false;
    }
  }

}
