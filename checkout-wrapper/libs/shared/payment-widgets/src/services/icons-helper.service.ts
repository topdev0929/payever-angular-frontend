import { Inject, Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';

@Injectable()
export class IconsHelperService {

  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    @Inject(PE_ENV) private env: EnvInterface,
  ) {

  }

  registerIcons(iconNames: string[]): void {
    iconNames?.forEach(name => this.matIconRegistry.addSvgIcon(
      name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/payment-widgets/logos/${name}.svg`),
    ));
  }
}
