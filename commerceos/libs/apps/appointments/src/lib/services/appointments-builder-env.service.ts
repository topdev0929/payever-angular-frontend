import { Inject, Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeAppointmentsBuilderEnv implements PeAppEnv {
  id: string;
  business: string;
  type = AppType.Appointments;
  host: string;
  api: string;
  ws: string;
  builder: string;
  mediaContainer = 'appointment';

  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
  ) {
    this.host = env.primary.appointmentHost;
    this.api = env.backend.appointments;
    this.ws = env.backend.builderAppointmentWs;
    this.builder = env.backend.builderAppointment;
  }
}
