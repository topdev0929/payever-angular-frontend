import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { entryLogo } from '@pe/base';
import { CreatePersonalFormEvent, CreatePersonalFormEventType } from '@pe/entry/personal-form';
import { RegistrationService } from '@pe/shared/registration';

@Component({
  selector: 'entry-employee-registration',
  templateUrl: './employee-registration.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeRegistrationComponent {
  industryIcon = this.registrationService.loadIndustryIcon(this.route.snapshot?.params.industry, entryLogo);
  businessId: string;
  notification$ = new BehaviorSubject<{ title: string, description: string }>(null);

  getDataWithBusinessId$ = this.route.params.pipe(
    tap(({ businessId }) => this.businessId = businessId),
    map(({ businessId }) => ({ businessId: businessId })),
  );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private registrationService: RegistrationService,
  ) {}

  onFormEvent(e: CreatePersonalFormEvent): void {
    if (CreatePersonalFormEventType.EmployeeIsCreated) {
      this.redirect(e);
    }
  }

  redirect(res: CreatePersonalFormEvent) {
    res.data.isVerified
    && this.router.navigate([`business/${this.businessId}/info/overview`]);

    res.data.isDomainTrusted && !res.data.isVerified
    && this.notification$.next({
      title: 'forms.employee_verify_notification.title',
      description: 'forms.employee_verify_notification.label',
    });

    res.data.needApproval && this.notification$.next({
      title: 'forms.employee_approve_notification.title',
      description: 'forms.employee_approve_notification.label',
    });
  }
}
