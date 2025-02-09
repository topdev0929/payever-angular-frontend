import { TestBed } from '@angular/core/testing';
import { PlatformService } from './platform.service';
import { LoaderManagerService } from './loader-manager.service';
import { BehaviorSubject } from 'rxjs';
import { isNull } from 'util';

describe('LoaderManagerService', () => {

  let platformService: any;
  let loaderManagerService: LoaderManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoaderManagerService,
        PlatformService
      ]
    });
    loaderManagerService = TestBed.get(LoaderManagerService);
    platformService = TestBed.get(PlatformService);
  });

  it('constructor should call backgroundImageSubject.next', () => {
    const data = 'data';
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(new BehaviorSubject({
      target: 'background',
      action: 'change',
      data
    }));

    loaderManagerService.background$.subscribe(value => {
      expect(value).toEqual(data);
    });
  });

  it('constructor should call backgroundImageDefaultSubject.next', () => {
    const data = 'data';
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(new BehaviorSubject({
      target: 'background-default',
      action: 'change',
      data
    }));

    loaderManagerService.backgroundDefault$.subscribe(value => {
      expect(value).toEqual(data);
    });
  });

  it('showAppLoader should next appLoaderSubject, dispatchEvent and next appLoaderShownSubject', () => {
    const show = true;
    const url = 'url';
    const loaderText = 'loaderText';
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(new BehaviorSubject({
      target: 'app_loader',
      action: 'shown'
    }));
    spyOn(platformService, 'dispatchEvent').and.stub();

    loaderManagerService.showAppLoader$.subscribe((value: any) => {
      expect(value).toEqual({
        show,
        url,
        loaderText
      });
    });

    loaderManagerService.appLoaderShown$.subscribe((value: any) => {
      if (isNull(value)) {
        return;
      }

      expect(value).toEqual({
        show,
        url,
        loaderText
      });
    });

    loaderManagerService.showAppLoader(show, url, loaderText);

    expect(platformService.dispatchEvent).toHaveBeenCalled();
  });

  it('showGlobalLoader should next globalLoaderSubject and dispatchEvent', () => {
    const show = true;
    const url = 'url';
    spyOnProperty(platformService, 'platformEvents$').and.returnValue(new BehaviorSubject({
      target: 'app_loader',
      action: 'shown'
    }));
    spyOn(platformService, 'dispatchEvent').and.stub();

    loaderManagerService.showGlobalLoader$.subscribe((value: any) => {
      expect(value).toEqual({
        show,
        url
      });
    });

    loaderManagerService.showGlobalLoader(show, url);

    expect(platformService.dispatchEvent).toHaveBeenCalled();
  });

  it('changeBackground should dispatchEvent', () => {
    const imageUrl = 'url';
    spyOn(platformService, 'dispatchEvent').and.stub();

    loaderManagerService.changeBackground(imageUrl);

    expect(platformService.dispatchEvent).toHaveBeenCalled();
  });

  it('navigate should next appNavigationSubject', () => {
    const url = 'url';
    loaderManagerService.navigate$.subscribe((value: any) => {
      expect(value).toEqual(url);
    });

    loaderManagerService.navigate(url);
  });
});
