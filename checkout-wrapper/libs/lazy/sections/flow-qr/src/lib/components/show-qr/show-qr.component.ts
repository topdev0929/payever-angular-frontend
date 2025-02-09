import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  Output,
  inject,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, BehaviorSubject } from 'rxjs';
import { takeUntil, mergeMap, map, tap } from 'rxjs/operators';

import { FlowStorage, SendToDeviceStorage } from '@pe/checkout/storage';
import { AuthSelectors, FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-show-qr',
  templateUrl: 'show-qr.component.html',
  styleUrls: ['./show-qr.component.scss'],
  providers: [PeDestroyService],
})
export class ShowFlowQrComponent implements AfterViewInit {

  @Select(FlowState.flow) private flow$!: Observable<FlowInterface>;

  @Input() embeddedMode: boolean;
  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() globalLoading: EventEmitter<boolean> = new EventEmitter();

  globalError: string;
  flow: FlowInterface;
  loading$ = new BehaviorSubject<boolean>(false);
  image$ = new BehaviorSubject<string>(null);

  public cdr = this.injector.get(ChangeDetectorRef);
  private readonly store = inject(Store);
  private flowStorage = this.injector.get(FlowStorage);
  private env = this.injector.get(PE_ENV);
  private sendToDeviceStorage = this.injector.get(SendToDeviceStorage);
  private http = this.injector.get(HttpClient);
  private destroy$ = this.injector.get(PeDestroyService);

  private readonly token = this.store.selectSnapshot(AuthSelectors.accessToken);

  constructor(private injector: Injector) {}

  ngAfterViewInit(): void {
    this.flow$.pipe(
      tap((flow) => {
        this.flow = flow;
        this.updateQR();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  requestQR(link: string): Observable<string> {
    return new Observable<string>((observer) => {
      const url = `${this.env.connect.qr}/api/download/png`;
      const params = {
        businessId: this.flow.businessId,
        businessName: this.flow.businessName,
        url: link,
        id: this.flow.id,
        // avatarUrl: null as string
      };
      this.http.get<Blob>(url, {
        params, responseType: 'blob' as any,
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }).subscribe(
        (blob: Blob) => {
          const reader = new FileReader();
          reader.onload = () => {
            observer.next(String(reader.result));
          };
          reader.onerror = (err) => {
            observer.error(err);
          };
          reader.readAsDataURL(blob);
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }

  private prepareLink(): Observable<string> {
    return this.sendToDeviceStorage.prapareAndSaveData({
      flow: this.flow,
      storage: this.flowStorage.getDump(this.flow.id),
      generate_payment_code: true,
      source: 'qr',
      force_no_order: true,
      force_no_header: false,
    }).pipe(
      map(code => this.sendToDeviceStorage.makeLink(code, this.flow.channelSetId)),
    );
  }

  private updateQR(): void {
    this.loading$.pipe(takeUntil(this.destroy$)).subscribe((loading) => {
      this.loading.emit(loading);
    });

    this.loading$.next(true);
    this.cdr.detectChanges();

    this.prepareLink().pipe(
      mergeMap(link => this.requestQR(link)),
      tap((blob) => {
        this.image$.next(blob);
        this.loading$.next(false);
        this.globalLoading.emit(false);
        this.cdr.detectChanges();
      },
      (err) => {
        this.globalError = err.message || $localize `:@@checkout_flow_qr.errors.unknown:`;
        this.loading$.next(false);
        this.globalLoading.emit(false);
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }
}
