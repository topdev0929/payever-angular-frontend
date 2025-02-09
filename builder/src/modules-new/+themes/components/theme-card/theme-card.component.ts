import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { PebTheme, PebThemeRoute } from '@pe/builder-core';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { WindowService } from '@pe/ng-kit/modules/window';
import { ThemeCardActions } from '../../../core/core.entities';
import { parseTestAttribute } from '../../../core/utils';
import { MatDialog } from '@angular/material';
import { ThemePreviewComponent } from '../theme-preview/theme-preview.component';
import { BuilderApi } from '../../../core/api/builder-api.service';
import { tap, takeUntil } from 'rxjs/operators';

export interface ThemeCardActionsInterface {
  install: null | ((input: any) => void);
  duplicate: null | ((input: any) => void);
  translate: null | ((input: any) => void);
  edit: null | ((input: any) => void);
  export: null | ((input: any) => void);
  delete: null | ((input: any) => void);
}

// tslint:disable:prefer-method-signature
export interface ThemeCardActionsPartialInterface {
  install?: (input: any) => void;
  duplicate?: (input: any) => void;
  translate?: (input: any) => void;
  edit?: (input: any) => void;
  export?: (input: any) => void;
  delete?: (input: any) => void;
}

@Component({
  selector: 'pe-builder-theme-card',
  templateUrl: './theme-card.component.html',
  styleUrls: ['./theme-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeCardComponent extends AbstractComponent {
  @Input()
  theme: PebTheme;

  @Input()
  loading: boolean;

  @Input()
  actionsToHide: ThemeCardActions[];

  @Output()
  install = new EventEmitter<PebTheme>();

  @Output()
  duplicate = new EventEmitter<PebTheme>();

  @Output()
  translate = new EventEmitter<PebTheme>();

  @Output()
  edit = new EventEmitter<PebTheme>();

  @Output()
  export = new EventEmitter<PebTheme>();

  @Output()
  delete = new EventEmitter<PebTheme>();

  constructor(
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private builderApi: BuilderApi,
  ) {
    super();
  }

  get themeLogo(): string {
    return this.theme.logo ? `url("${this.theme.logo}")` : null;
  }

  isActionEnabled(actionName: ThemeCardActions): boolean {
    return this.actionsToHide.indexOf(actionName) < 0;
  }

  getTestingAttribute(val: string): string {
    return parseTestAttribute(val);
  }

  openPreview(theme: PebTheme): void {
    const rootRoute: PebThemeRoute = theme.routing.find(r => r.url === '/');

    this.builderApi.getPage(
      rootRoute ? rootRoute.pageId : theme.routing[0].pageId,
    ).pipe(
      takeUntil(this.destroyed$),
      tap(page => {
        this.dialog.open(ThemePreviewComponent, {
          position: {
            top: '0',
            left: '0',
          },
          height: '100vh',
          maxWidth: '100vw',
          width: '100vw',
          panelClass: 'preview-modal',
          data: { page },
        });
      }),
    ).subscribe();
  }
}
