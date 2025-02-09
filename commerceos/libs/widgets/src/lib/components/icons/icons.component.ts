import { ChangeDetectorRef, Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { EMPTY } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { EmployeesPermissionService } from '@pe/shared/business';

import { WidgetData } from '../../interfaces';
import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-icons',
  templateUrl: './icons.component.html',
  styleUrls: [
    '../common.widget.scss',
    './icons.component.scss',
  ],
  providers: [PeDestroyService],
})
export class IconsComponent extends AbstractWidgetComponent {

  constructor(
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private employeesPermissionService: EmployeesPermissionService,
    private destroy$: PeDestroyService,
  ) {
    super();
  }

  clickItem($event: MouseEvent, widgetData: WidgetData) {
    widgetData.loading = true;
    this.employeesPermissionService.checkApps(widgetData.code).pipe(
      switchMap((isAppAvailable) => {
        if (isAppAvailable) {
          super.clickItem($event, widgetData);

          return this.router.events.pipe(
            filter(ev => ev instanceof NavigationCancel || ev instanceof NavigationEnd),
            tap(() => {
              widgetData.loading = false;
              this.changeDetectorRef.detectChanges();
            }),
          );
        }

        return EMPTY;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getRetinaIcon(icon: string) {
    return (icon || '').replace('32', '64');
  }
}
