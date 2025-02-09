import { Component, ChangeDetectionStrategy, OnInit, Inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { ConfigConfigInterface, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ActionTypeEnum } from '../../../../shared';
import { FadeInAnimation } from '../../../containers';
import { DetailsState } from '../../../store';

const DISABLE_DESCRIPTION_ACTIONS: ActionTypeEnum[] = [
  ActionTypeEnum.Edit,
  ActionTypeEnum.Refund,
  ActionTypeEnum.Cancel,
];

const DISABLE_DESCRIPTION_ENV: ConfigConfigInterface['env'] = 'live';

@Component({
  selector: 'pe-actionable-text-section',
  templateUrl: './actionable-text.component.html',
  styleUrls: ['./actionable-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [FadeInAnimation],
})
export class ActionableTextSectionComponent implements OnInit {

  actionableText$: Observable<string>;
  readonly actions$ = this.store.select(DetailsState.actionsEnabled);

  constructor(
    private store: Store,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
      ) {}

  getWarningIcon(): string {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-transactions/icon-warning.svg`) as string;
  }

  ngOnInit(): void {
    this.actionableText$ = this.actions$.pipe(
      // Take description of first action, as its the first chronological action to perform
      // Actions are ordered by logical next action to perform
      map(actions => actions[0]),
      filter(action => action?.description
        && (this.env.config.env === DISABLE_DESCRIPTION_ENV
          ? !DISABLE_DESCRIPTION_ACTIONS.includes(action.action)
          : true
        )
      ),
      map(action => action?.description ?? ''),
    );
    this.loadCDNIcon();
  }

  private loadCDNIcon(): void {
    this.matIconRegistry.addSvgIcon('iconWarning', this.domSanitizer.bypassSecurityTrustResourceUrl(
      `${this.env.custom.cdn}/icons-transactions/icon-warning.svg`));
  }
}
