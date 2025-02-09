import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { LoaderService } from '@pe/checkout/core/loader';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'debug',
  template: `
  <h1>Debug page</h1>
  <p>{{ text }}</p>
  <h3>Log errors:</h3>
  <p *ngFor="let error of errors" style="color: red;">{{ error }}</p>
  `,
})
export class DebugComponent implements OnInit {

  text = 'Loading...';
  protected readonly domain: string = 'santander-psp-api-failed';

  constructor(
    private loaderService: LoaderService,
  ) {
    this.loaderService.loaderGlobal = false;
  }

  get errors(): string[] {
    return (window as any).payeverConsoleErrorMessages?.reverse();
  }

  ngOnInit(): void {
    sessionStorage.clear();
  }
}
