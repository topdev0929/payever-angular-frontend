import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { LoginResponse } from '@pe/auth';
import { entryLogo } from '@pe/base';

interface IconInterface {
  icon: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'pe-entry-employee-login',
  templateUrl: './employee-login.component.html',
  styleUrls: ['./employee-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeLoginComponent {
  businessId: string;
  businessId$ = this.route.params.pipe(
    map(({ businessId }) => {
      this.businessId = businessId;

      return businessId;
    }),
  );

  notification$ = new Subject<{ title: string, description: string }>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  onSuccessLogin(data: LoginResponse): void {
    localStorage.removeItem('pe_opened_business');
    localStorage.removeItem('pe_active_business');
    localStorage.removeItem('pe_user_email');

    this.redirect(data);
  }

  onSecondFactorCode(): void {
    const queryParams = { queryParams: { returnUrl: `business/${this.businessId}/info/overview` } };
    this.router.navigate(['second-factor-code'], queryParams);
  }

  onRegister(): void {
    this.router.navigate([`registration/employee/${this.businessId}`]);
  }

  redirect(data) {
    data.isVerified
    && this.router.navigate([`business/${this.businessId}/info/overview`]);

    data.isDomainTrusted && !data.isVerified
    && this.notification$.next({
      title: 'forms.employee_verify_notification.title',
      description: 'forms.employee_verify_notification.label',
    });

    data.needApproval && this.notification$.next({
      title: 'forms.employee_approve_notification.title',
      description: 'forms.employee_approve_notification.label',
    });
  }

  getIndustryIcon(): IconInterface {
    const industry: string = this.route.snapshot?.params.industry;
    const icon = `#icon-industries-${industry}`;

    if (industry) {
      (window as any).PayeverStatic.IconLoader.loadIcons(['industries']);
    }

    return industry ? { icon, height: 30 } : entryLogo;
  }
}
