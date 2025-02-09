import { Component, OnInit } from '@angular/core';
import { AbstractComponentDirective } from '../shared/abstract/abstract.component';
import { AppThemeEnum, PebEnvService } from '@pe/common';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class SandboxRootComponent extends AbstractComponentDirective implements OnInit {
  body = document.body;
  isMobile = window.innerWidth <= 720;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  constructor(private envService: PebEnvService) {
    super();
  }
  ngOnInit() {
    this.theme = AppThemeEnum.default;
    this.body.classList.add(this.theme);
  }
}
