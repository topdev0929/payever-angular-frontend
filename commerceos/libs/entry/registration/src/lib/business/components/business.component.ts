import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { BusinessRegistrationData } from '@pe/api';
import { entryLogo } from '@pe/base';
import { PeDestroyService } from '@pe/common';
import { RegistrationService } from '@pe/shared/registration';

import { PartnerDataInterface } from '../../interfaces';

@Component({
  selector: 'entry-business-registration',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss'],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessRegistrationComponent implements OnInit {
  @Input() entryLogo = entryLogo;

  messageData: string;
  industryIcon = entryLogo;
  data$ = this.route.data.pipe(
    take(1),
    map((response: {
      businessRegistrationData: BusinessRegistrationData;
      partner: PartnerDataInterface;
    }) => ({
      businessRegistrationData: response.businessRegistrationData,
      businessForm: response?.partner?.form ?? [],
    })),
  );

  constructor(
    private registrationService: RegistrationService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.industryIcon = this.registrationService.loadIndustryIcon(this.route.snapshot?.params.industry, entryLogo);
  }

}
