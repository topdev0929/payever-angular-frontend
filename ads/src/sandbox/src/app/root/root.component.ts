import { Component, ElementRef, HostBinding, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Portal } from '@angular/cdk/portal';

import { globalPalette } from '../../styles/palette';
import { AbstractComponent } from '../shared/abstract/abstract.component';
import { SandboxSettingsService } from '../shared/settings/settings.service';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
})
export class SandboxRootComponent extends AbstractComponent implements OnInit {
  customToolsPortal: Portal<any> = null;

  constructor(
    public router: Router,
    private settingsService: SandboxSettingsService,
    private elementRef: ElementRef,
  ) {
    super();
  }

  ngOnInit() {
    this.setGlobalPalette();
  }

  @HostBinding('class.front-page')
  get classFrontPage() {
    return this.router.url === '/';
  }

  openSettings() {
    this.settingsService.open();
  }

  setGlobalPalette() {
    const thisCmpElement: HTMLElement = this.elementRef.nativeElement;

    Object.entries(globalPalette).forEach(([key, value]) => {
      thisCmpElement.style.setProperty('--'+key, value);
    })
  }
}
