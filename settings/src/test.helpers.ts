import { BehaviorSubject, Subject, throwError } from 'rxjs';

export class FakeWindowService {
  width$ = new BehaviorSubject(this.width);
  constructor(
    private width: any
  ) { }
}

export class FakeEnvironmentConfigService {
  getCustomConfig = () => ({
    storage: '',
    i18n: '',
    proxy: '',
    cdn: ''
  })

  getConfig$ = () => (new BehaviorSubject({})).asObservable();

  getBackendConfig = () => ({
    appRegistry: '',
    auth: '',
    builder: '',
    channels: '',
    checkout: '',
    commerceos: '',
    connect: '',
    coupons: '',
    debitoor: '',
    mailer: '',
    marketing: '',
    media: '',
    payments: '',
    plugins: '',
    pos: '',
    products: '',
    settings: '',
    shipping: '',
    shops: '',
    thirdParty: '',
    transactions: '',
    twilio: '',
    users: '',
    widgets: '',
    wallpapers: '',
    notifications: '',
    notificationsWs: '',
    inventory: ''
  })
}

export class FakeEditWidgetsService {
  widgetTutorials$ = new BehaviorSubject(this.tutorials);
  watched: boolean = false;
  constructor(
    private tutorials: any
  ) { }

  tutorialWatched = () => {
    this.watched = true;
    return new BehaviorSubject({});
  }
}

export class FakeWallpaperService {
  backgroundImage$ = new BehaviorSubject('');
  backgroundImage = '';
  blurredBackgroundImage$ = new BehaviorSubject('');
  blurredBackgroundImage = '';
  showDashboardBackground = () => { };
}

export class FakeAuthService {
  getUserData = () => ({
    uuid: ''
  })
}

export class FakeTranslationLoaderService {
  loadTranslations = () => new BehaviorSubject(undefined);
}

export class FakeTranslateService {
  translate = (key: any) => key;
  hasTranslation = () => { }
}

export class FakeLoaderService {
  loadMicroScript = (appName: string, id: string) => {
    if (id === 'id_error') {
      return throwError({});
    }
    return new BehaviorSubject(undefined)
  }
}

export class FakeEnvService {
  businessIdStorage$: BehaviorSubject<string> = new BehaviorSubject(this.businessId);
  businessUuid$ = this.businessIdStorage$.asObservable();
  businessUuid: string = this.businessId;

  constructor(
    private businessId?: string
  ) { }
}

export class FakePlatformService {
  microAppReady$ = new BehaviorSubject('appName');
  microNavigation$ = new BehaviorSubject('');

  dispatchEvent = () => { }
}

export class FakeBackgroundService {
  preloadImages = () => new BehaviorSubject(null)
}


export class FakeRouter {
  navigate$: Subject<void> = new Subject();
  navigate() {
    return new Promise((resolve, reject) => {
      resolve();
      this.navigate$.next();
    });
  }
  public url = '/personal'
}

export class FakeHttpClient {
  get = () => {
    const result = new BehaviorSubject('');
    result.complete();
    return result;
  }

  post = () => {
    const result = new BehaviorSubject('');
    result.complete();
    return result;
  }

  patch = () => {
    const result = new BehaviorSubject('');
    result.complete();
    return result;
  }

  put = () => {
    const result = new BehaviorSubject('');
    result.complete();
    return result;
  }

  delete = () => {
    const result = new BehaviorSubject('');
    result.complete();
    return result;
  }

  request = () => {
    const result = new BehaviorSubject('');
    result.complete();
    return result;
  }
}

export class FakeActivatedRoute {
  snapshot = {
    params: {
      businessId: '1234'
    }
  }
  public data: BehaviorSubject<Object> = new BehaviorSubject({
    business: {
      _id: '1234'
    },
    userAccount: {
      shippingAddresses: []
    }
  })
  public params: BehaviorSubject<Object> = new BehaviorSubject({
    businessId: '1234'
  });
}

export class FakeMicroRegistryService {
  getMicroConfig = () => ({
    bootstrapScriptUrl: ''
  })
}

export class FakeMicroLoaderService {
  loadScript = () => new BehaviorSubject({});
}

export class FakeApiService {
  updateBusinessData = () => new BehaviorSubject<any>({});
  getTwoFactorSettings = () => new BehaviorSubject<any>({});
  updatePassword = () => new BehaviorSubject({});
  updateUserAccount = () => new BehaviorSubject({});
}

export class FakeHeaderService {
  setPersonalHeader = () => { }
  setBusinessHeader = () => { }
  setShortHeader = () => { }
}

export class FakeLocaleConstantsService {
  getCountryList = () => []
  getContinentList = () => []
}

export class FakeCoreConfigService {
  CURRENCIES = [
    'CHF',
    'DKK',
    'EUR',
    'GBP',
    'NOK',
    'SEK',
    'USD'
  ]
}




