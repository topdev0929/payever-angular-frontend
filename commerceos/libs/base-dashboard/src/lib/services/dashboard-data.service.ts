import { Injectable, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { DockerItemInterface, DockerState } from '@pe/docker';

@Injectable()
export class DashboardDataService implements OnDestroy {

  @Select(DockerState.dockerItems) dockerItems$: Observable<DockerItemInterface[]>;

  showEditAppsButton: boolean;
  showCloseAppsButton: boolean;
  label: string;
  logo: string;
  userName: string;
  private _apps$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private destroy$ = new Subject<void>();


  get apps$(): Observable<any> {
    return this._apps$.asObservable();
  }

  constructor() {
    this.dockerItems$.pipe(
      tap(() => {
        this.showEditAppsButton = false;
        this.showCloseAppsButton = true;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  apps(apps): void {
    apps = apps.slice().sort((a, b) => {
      if (typeof a['order'] === 'undefined') {
        return 1;
      }
      if (typeof b['order'] === 'undefined') {
        return -1;
      }

      return a['order'] - b['order'];
    });
    const settingsIndex = apps.findIndex((elem: any) => elem.code === 'settings');
    const settings = apps.splice(settingsIndex, 1);
    apps.push(...settings);
    this._apps$.next(apps);
  }
}
