import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { PebTheme, PebThemeCollectionStore } from '@pe/builder-core';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { ThemeData } from '../../../core/theme.data';

@Component({
  selector: 'builder-clear-actions',
  templateUrl: './clear-actions.component.html',
  styleUrls: ['./clear-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearActionsComponent implements OnInit {

  themes$: Observable<PebTheme[]> = this.themesStore.themes$.pipe(filter(t => !!t));
  response$ = new BehaviorSubject<any>([]);

  constructor(
    private envConfig: EnvironmentConfigService,
    private http: HttpClient,
    private themesStore: PebThemeCollectionStore,
    private themeData: ThemeData,
  ) { }

  ngOnInit(): void {
    const { businessId, applicationId } = this.themeData;
    this.themesStore.loadApplicationThemes(businessId, applicationId);
  }

  clearActions(theme: PebTheme): void {
    const url = `${this.envConfig.getBackendConfig().builder}/api/themes/${theme.id}/clear-actions`;

    this.http.post(url, {}).pipe(
      tap(response => this.response$.next(response)),
    ).subscribe();
  }

  revertClearActions(theme: PebTheme): void {
    const url = `${this.envConfig.getBackendConfig().builder}/api/themes/${theme.id}/revert-clear-actions`;

    this.http.post(url, {}).pipe(
      tap(response => this.response$.next(response)),
    ).subscribe();
  }
}
