import { Input, Directive } from '@angular/core';
import { take, tap } from 'rxjs/operators';

import { AppSetUpStatusEnum } from '../interfaces/enums';
import { Widget, WidgetData } from '../interfaces/widget.interface';

@Directive()
export abstract class AbstractWidgetComponent {
  readonly AppSetUpStatusEnum: typeof AppSetUpStatusEnum = AppSetUpStatusEnum;
  widgetTheme: string;

  private _widget: Widget;

  @Input()
  set widget(widgetInstance: Widget) {
    this._widget = widgetInstance;
  }

  get widget(): Widget {
    return this._widget;
  }

  clickItem($event: MouseEvent, widgetData: WidgetData) {
    if (widgetData.onSelect) {
      if (!widgetData.notProcessLoading) {
        widgetData.loading = true;
      }
      widgetData.onSelect(widgetData.onSelectData || true).pipe(
        take(1),
        tap(() => {
          if (!widgetData.notProcessLoading) {
            widgetData.loading = false;
          }
        }),
      ).subscribe();
    }
  }
}
