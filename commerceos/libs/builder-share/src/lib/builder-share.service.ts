import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { PeAppEnv } from '@pe/app-env';
import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PeBuilderShareComponent } from './builder-share.component';
import { PeBuilderShareGetLinkComponent } from './get-link/get-link.component';


@Injectable({ providedIn: 'any' })
export class PeBuilderShareService {

  constructor(
    private overlayWidgetService: PeOverlayWidgetService,
  ) { }

  openShareDialog(): PeOverlayRef {
    const doneSubject$ = new ReplaySubject(1);
    const overlayRef = this.overlayWidgetService.open({
      component: PeBuilderShareComponent,
      hasBackdrop: true,
      panelClass: 'builder-share-panel',
      headerConfig: {
        title: 'Share',
        theme: 'dark',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          overlayRef.close();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          doneSubject$.next();
        },
      },
      data: { done$: doneSubject$.asObservable() },
      backdropClick: () => {},
    });
    overlayRef.afterClosed.subscribe(() => doneSubject$.complete());

    return overlayRef;
  }

  openGetLinkDialog(appEnv:PeAppEnv): PeOverlayRef {
    const doneSubject$ = new ReplaySubject(1);
    const overlayRef = this.overlayWidgetService.open({
      component: PeBuilderShareGetLinkComponent,
      hasBackdrop: true,
      panelClass: 'builder-share-panel',
      headerConfig: {
        title: 'Share',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          overlayRef.close();
        },
        doneBtnTitle: 'Copy link',
        doneBtnCallback: () => {
          doneSubject$.next();
        },
      },
      data: { done$: doneSubject$.asObservable(), appEnv },
      backdropClick: () => {},
    });
    overlayRef.afterClosed.subscribe(() => doneSubject$.complete());

    return overlayRef;
  }
}
