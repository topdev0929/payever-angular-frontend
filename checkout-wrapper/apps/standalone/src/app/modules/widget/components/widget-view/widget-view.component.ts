import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, skip } from 'rxjs/operators';

import { PaymentWidgetEnum, WidgetConfigInterface, WidgetTypeEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';


interface WidgetParamsType {
  channelSet: string;
  type: WidgetTypeEnum;
  theme: 'light' | 'dark';
  cart: PaymentItem[];
  paymentMethod: PaymentWidgetEnum;
  amount: number;
  isDebugMode: boolean;
  config: WidgetConfigInterface,
}

@Component({
  selector: 'widget-view',
  templateUrl: './widget-view.component.html',
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetViewComponent implements OnInit, OnDestroy {
  private readonly listeners: (() => void)[] = [];

  private settings$ = new BehaviorSubject<WidgetParamsType>({} as WidgetParamsType);

  public vm$ = this.settings$.pipe(
    skip(1),
    map(settings => ({
      ...settings,
      config: {
        ...settings.config,
        iframeMode: true,
      },
    }))
  );

  constructor(
    private readonly renderer: Renderer2,
  ) {
    document.body.classList.add('pe-widget-preview-container');
  }

  ngOnInit(){
    this.listeners.push(
      this.renderer.listen(
        window,
        'message',
        (event: MessageEvent) => {
          if (event.data.event === 'peWidgetSettings') {
            delete event.data.event;
            this.settings$.next(event.data);
          }
        },
      ),
    );
  }

  ngOnDestroy(): void {
    this.listeners.forEach(listener => listener());

    document.body.classList.remove('pe-widget-preview-container');
  }
}
