import { Injectable } from '@angular/core';


@Injectable()
export abstract class FormConfigAbstractService<FormConfigType = any, ConfigType = any> {
  init<ParamsInterface = any>(params: ParamsInterface) {
    // do nothing.
  }

  abstract stepperConfig(data: FormConfigType): ConfigType;
}
