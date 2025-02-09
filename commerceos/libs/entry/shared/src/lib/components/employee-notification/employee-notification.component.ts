import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'entry-shared-employee-notification',
  templateUrl: './employee-notification.component.html',
  styleUrls: ['./employee-notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})

export class EmployeeNotificationComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() businessId: string;

  constructor(
    private router: Router,
  ) {}

  navigateToEntry(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/login/employees', this.businessId]);
  }
}
