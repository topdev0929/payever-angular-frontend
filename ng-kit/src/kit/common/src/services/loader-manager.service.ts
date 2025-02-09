import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, ReplaySubject } from 'rxjs';
import { take, filter } from 'rxjs/operators';

import { LoaderInterface, PlatformEventInterface } from '../interfaces';
import { PlatformService } from './platform.service';

@Injectable()
export class LoaderManagerService {

  private appLoaderSubject: Subject<LoaderInterface> = new Subject<LoaderInterface>();
  private appLoaderShownSubject: BehaviorSubject<LoaderInterface> = new BehaviorSubject<LoaderInterface>(null);
  private appNavigationSubject: Subject<string> = new Subject<string>();
  private globalLoaderSubject: Subject<LoaderInterface> = new Subject<LoaderInterface>();
  private backgroundImageSubject: ReplaySubject<string> = new ReplaySubject<string>();
  private backgroundImageDefaultSubject: ReplaySubject<string> = new ReplaySubject<string>();

  constructor(
    private platformService: PlatformService
  ) {
    this.platformService.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === 'background' && event.action === 'change'))
      .subscribe((event: PlatformEventInterface) => {
        this.backgroundImageSubject.next(event.data);
      });

    this.platformService.platformEvents$.pipe(
      filter((event: PlatformEventInterface) => event.target === 'background-default' && event.action === 'change'))
      .subscribe((event: PlatformEventInterface) => {
        this.backgroundImageDefaultSubject.next(event.data);
      });
  }

  get background$(): Observable<string> {
    return this.backgroundImageSubject;
  }

  get backgroundDefault$(): Observable<string> {
    return this.backgroundImageDefaultSubject;
  }

  get showAppLoader$(): Observable<LoaderInterface> {
    return this.appLoaderSubject.asObservable();
  }

  get showGlobalLoader$(): Observable<LoaderInterface> {
    return this.globalLoaderSubject.asObservable();
  }

  get navigate$(): Observable<string> {
    return this.appNavigationSubject.asObservable();
  }

  get appLoaderShown$(): Observable<LoaderInterface> {
    return this.appLoaderShownSubject.asObservable();
  }

  showAppLoader(show: boolean, url: string = null, loaderText: string = null): void {
    const loaderData: LoaderInterface = { show, url, loaderText };
    this.appLoaderSubject.next(loaderData);

    this.platformService.dispatchEvent({
      target: 'app_loader',
      action: show ? 'show' : 'hide',
      data: loaderText
    });

    if (show && url) {
      this.platformService.platformEvents$.pipe(
        filter((event: PlatformEventInterface) => event.target === 'app_loader' && event.action === 'shown'),
        take(1), )
        .subscribe(() => {
          this.appLoaderShownSubject.next(loaderData);
        });
    }
  }

  showGlobalLoader(show: boolean, url: string = null): void {
    this.globalLoaderSubject.next({ show, url });
    this.platformService.dispatchEvent({
      target: 'global_loader',
      action: show ? 'show' : 'hide'
    });

  }

  changeBackground(imageUrl: string): void {
    this.platformService.dispatchEvent({
      target: 'background',
      action: 'change',
      data: imageUrl
    });
  }

  navigate(url: string): void {
    this.appNavigationSubject.next(url);
  }

}
