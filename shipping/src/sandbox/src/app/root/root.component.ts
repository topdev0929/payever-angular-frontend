import { Component, OnInit } from '@angular/core';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { AppThemeEnum, EnvService } from '@pe/common';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class SandboxRootComponent extends AbstractComponent implements OnInit {
  body = document.body;
  isMobile = window.innerWidth <= 720;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  constructor(private envService: EnvService) {
    super();
  }
  ngOnInit() {
    this.body.classList.add(this.theme);
  }
}
