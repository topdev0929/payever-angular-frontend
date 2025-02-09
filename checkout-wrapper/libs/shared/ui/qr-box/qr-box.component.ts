import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/destroy';

import { ApiQrService } from './api.qr.service';

@Component({
  selector: 'ui-qr-box',
  templateUrl: './qr-box.component.html',
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class QrBoxComponent implements OnInit {
  @Input() set url(value: string) {
    this.url$.next(value);
  }

  private url$ = new BehaviorSubject<string>('');

  signingQr$ = new BehaviorSubject<SafeUrl>(null);

  constructor(
    private apiQrService: ApiQrService,
    private domSanitizer: DomSanitizer,
    private destroy$: PeDestroyService,
  ) {}

  ngOnInit(): void {
    this.url$.pipe(
      filter(value => this.isValidUrl(value)),
      switchMap(url => this.apiQrService.downloadQrCode(url).pipe(
        tap((blob) => {
          const url = URL.createObjectURL(blob);
          const safeUrl = this.domSanitizer.bypassSecurityTrustUrl(url);

          this.signingQr$.next(safeUrl);
        })
      )),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private isValidUrl(value: string): boolean {
    try {
      return value && !!new URL(value);
    } catch (err) {
      return false;
    }
  }
}
