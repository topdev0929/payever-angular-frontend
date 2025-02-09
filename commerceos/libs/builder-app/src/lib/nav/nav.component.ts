import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebSetSidebarsAction } from '@pe/builder/state';
import { BusinessInterface } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { AbbreviationPipe } from '@pe/shared/pipes';
import { BusinessState } from '@pe/user';
import { WindowService } from '@pe/window';


export const peNavIcons = {
  edit: '/assets/icons/edit.svg',
  settings: '/assets/icons/settings.svg',
  theme: '/assets/icons/themes.svg',
};

@Component({
  selector: 'pe-editor-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [AbbreviationPipe],
})
export class PeNavComponent implements OnInit {
  @Select(BusinessState.businessData) data$!: Observable<BusinessInterface>;
  business$ = this.data$.pipe(
    map(data => data.name),
  );

  title = `${this.appEnv.type}-app.sidebar.title`;
  private isMobile = false;

  constructor(
    private readonly appEnv: PeAppEnv,
    private readonly store: Store,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
    private windowService: WindowService,
    private readonly destroy$: PeDestroyService,
  ) {
    for (let key in peNavIcons) {
      matIconRegistry.addSvgIcon(key, domSanitizer.bypassSecurityTrustResourceUrl(`${peNavIcons[key]}`));
    }
    matIconRegistry.addSvgIcon(
      'small-close-icon',
      domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/small-close-icon.svg'),
    );
  }

  ngOnInit(): void {
    this.windowService.isMobile$.pipe(
      tap((isMobile: boolean) =>{
         this.isMobile = isMobile;
         if (this.isMobile) {
          this.closeSidebar();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  closeSidebar() {
    this.store.dispatch(new PebSetSidebarsAction({ left: false }));
  }

  open(){
    if (this.isMobile) {
      this.closeSidebar();
    }
  }
}
