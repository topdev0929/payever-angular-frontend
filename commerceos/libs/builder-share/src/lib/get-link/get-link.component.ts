import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, Inject, Injector, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEditorApi } from '@pe/builder/api';
import { PebPage } from '@pe/builder/core';
import { PebEditorState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PeBuilderShareApi } from '../builder-share.api';

import { BuilderShareSocialEnum, BuilderShareSocialInterface, SOCIAl_MEDIA_OPTIONS } from './get-link-constant';

@Component({
  selector: 'pe-get-link',
  templateUrl: './get-link.component.html',
  styleUrls: ['./get-link.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, PeBuilderShareApi],
})

export class PeBuilderShareGetLinkComponent implements OnInit {

  readonly socialMediaOptions = SOCIAl_MEDIA_OPTIONS;
  readonly link$ = new BehaviorSubject<string>('');
  protected translateService = this.injector.get(TranslateService);

  constructor(
    private clipboard: Clipboard,
    @Inject(PE_OVERLAY_DATA) private data: any,
    private destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
    private env: PeAppEnv,
    protected injector: Injector,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private readonly editorApi: PebEditorApi,
    private readonly store: Store,
  ) {
    this.socialMediaOptions.map(item =>
      matIconRegistry.addSvgIcon(item.alt, domSanitizer.bypassSecurityTrustResourceUrl(item.image)),
    );
  }

  ngOnInit(): void {
    this.getPublishedLink$().pipe(
      tap(link => this.link$.next(link)),
      takeUntil(this.destroy$),
    ).subscribe();

    this.data?.done$?.pipe(
      tap(() => {
        if (this.link$.value && this.clipboard.copy(this.link$.value)) {
          this.snackbarService.toggle(true, {
              content: this.translateService.translate('builder-app.dashboard.actions.link_copied'),
              iconId: 'icon-commerceos-success',
              iconSize: 24,
              iconColor: '#00B640',
          });
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  setValue(item : BuilderShareSocialInterface){
    let url;
    switch (item.payload){
      case BuilderShareSocialEnum.facebook:
        url= `https://www.facebook.com/sharer/sharer.php?u=${this.link$.value}`;
        break;
      case BuilderShareSocialEnum.twitter:
        url= `https://twitter.com/intent/tweet?url=${this.link$.value}`;
        break;
      case BuilderShareSocialEnum.pinterest:
        url= `https://www.pinterest.com/pin/create/button/?url=${this.link$.value}`;
        break;
      case BuilderShareSocialEnum.email:
        url= `mailto:?subject=Payever Shop&body=${this.link$.value}`;
        break;
    }
    if (url){
      const config = item.payload !== BuilderShareSocialEnum.email ? '_blank' : "_self";
      window.open(url, config);
    }
  }

  private getPublishedLink$(): Observable<string> {
    const publishedVersion = this.store.selectSnapshot(PebEditorState.publishedVersion);
    const themeId = this.store.selectSnapshot(PebEditorState.themeId);

    return this.editorApi.getApp().pipe(
      filter(app => !!app),
      switchMap(app => this.editorApi.getPageList(themeId, publishedVersion).pipe(
        map((pages: PebPage[]) => {
          const page = this.store.selectSnapshot(PebEditorState.activePage);
          const publishedPage = pages.find(p => p.id === page.id);
          const subLink = publishedPage?.url ? `${publishedPage?.url.startsWith('/') ? '' : '/'}${publishedPage?.url}` : '';

          return `https://${app.accessConfig.internalDomain}.${this.env.host}${subLink}`;
        }),
      )),
    );
  }
}
