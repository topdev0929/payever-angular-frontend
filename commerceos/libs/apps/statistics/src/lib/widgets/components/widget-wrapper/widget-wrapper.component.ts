import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  HostBinding,
  Input,
  NgModuleFactory,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../../infrastructure';
import { sizeOptions } from '../../../overlay/constants/size-options.constant';
import { mapWidgetData } from '../../../shared/utils';
import { MOCK_DATA } from '../../mock.data';

@Component({
  selector: 'peb-widget-wrapper',
  templateUrl: './widget-wrapper.component.html',
  styleUrls: ['./widget-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class WidgetWrapperComponent implements OnInit, OnDestroy {

  /** Widget config */
  @Input() config: any = {};

  /** Use mock data source */
  @Input() useDefaultDataSource = false;

  /** Show/hide edit button */
  @Input() showEditBtn = false;

  /** Whether line graph is resizable */
  @Input() resizableLineGraph = false;

  /** Overlay ref */
  editOverlayRef: PeOverlayRef;

  /** Whether widget is clickable */
  @HostBinding('class.clickable') @Input() isClickable = false;

  /**
   * Whether is edit mode active
   * @deprecated
   */
  editMode = false;

  NO_DATA_MESSAGE: string = this.translateService.translate('statistics.action.without-data');

  constructor(
    protected cdr: ChangeDetectorRef,
    private compiler: Compiler,
    protected apiService: ActualPeStatisticsApi,
    public widgetService: PeWidgetService,
    private overlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private authTokenService: PeAuthService,
    private readonly destroy$: PeDestroyService,
    private confirmScreenService: ConfirmScreenService,
    private readonly destroyed$: PeDestroyService,
  ) {
  }

  private showConfirmationDialog(subtitle: string) {
    const headings: Headings = {
      title: this.translateService.translate('statistics.confirm_dialog.are_you_sure'),
      subtitle,
      declineBtnText: this.translateService.translate('statistics.action.no'),
      confirmBtnText: this.translateService.translate('statistics.action.yes'),
    };

    return this.confirmScreenService.show(headings, true).pipe(
      filter(val => !!val),
      takeUntil(this.destroyed$),
    );
  }

  /** On edit button click opens edit dialog */
  onEditMode = () => {
    import('../../../overlay').then(({ StatisticsOverlayModule, PeStatisticsEditFormComponent }) => {
      const moduleFactory = this.compiler.compileModuleAsync(StatisticsOverlayModule);
      moduleFactory.then((factory: NgModuleFactory<any>) => {
        const onSaveSubject$ = new BehaviorSubject(null);
        const data = {
          data: this.config,
        };
        const headerConfig = {
          onSaveSubject$,
          title: this.translateService.translate('statistics.overlay_titles.edit_widget'),
          backBtnTitle: this.translateService.translate('statistics.action.cancel'),
          backBtnCallback: () => {
            this.showConfirmationDialog(
              this.translateService.translate('statistics.confirm_dialog.subtitle_exit'),
            ).pipe(
              tap(() => {
                this.editOverlayRef.close();
              }),
              takeUntil(this.destroyed$),
            ).subscribe();
          },
          doneBtnTitle: this.translateService.translate('statistics.action.done'),
          doneBtnCallback: () => {
            onSaveSubject$.next(true);
            this.editOverlayRef.close();
          },
          onSave$: onSaveSubject$.asObservable(),
        } as any;
        this.editOverlayRef = this.overlayWidgetService.open({
          data,
          headerConfig,
          component: PeStatisticsEditFormComponent,
          backdropClick: () => {
            this.showConfirmationDialog(
              this.translateService.translate('statistics.confirm_dialog.subtitle_exit'),
            ).pipe(
              tap(() => {
                this.editOverlayRef.close();
              }),
              takeUntil(this.destroyed$),
            ).subscribe();

            return EMPTY;
          },
        });
      });
    });
  };

  ngOnInit(): void {
    /** Refreshes widget on edit */
    this.widgetService.refreshWidget$.subscribe((val) => {
      if (val) {
        if (this.config.id === val) {
          this.widgetService.webSocket.send(
            JSON.stringify({
              event: 'get-data',
              data: {
                widgetId: this.config.id,
                token: this.authTokenService.token,
              },
            }),
          );
        }
      }
    });
    /**
     * Whether widget is filtered
     * if filtered all values show 0
     */
    if (this.config?.filtered) {
      const data = this.config.widgetSettings.map((settings) => {
        if (settings.length === 0) {
          return null;
        } else if (settings.length === 1) {
          if (settings[0].type === 'text') {
            return settings[0].value;
          }
        } else {
          return 0;
        }
      });
      const newData = [];
      let chunk = [];
      data.forEach((element, index) => {
        if (index !== 0) {
          if (index % 3 === 0) {
            newData.push(chunk);
            chunk = [];
          }
        }
        chunk.push(element);
        if (index === data.length - 1) {
          newData.push(chunk);
        }
      });

      this.config.dataSource = mapWidgetData(newData);
      this.cdr.detectChanges();
    } else {
      /** Gets widget data */
      if (this.widgetService.webSocket) {
        this.widgetService.webSocket.addEventListener('open', this.openCallback.bind(this));
        this.widgetService.webSocket.addEventListener('message', this.messageCallback.bind(this));
        this.widgetService.webSocket.addEventListener('error', this.errorCallback.bind(this));
      }

      this.defaultDataSource();
    }
  }


  openCallback(open) {
    this.widgetService.webSocket.send(
      JSON.stringify({
        event: 'get-data',
        data: {
          widgetId: this.config.id,
          token: this.authTokenService.token,
        },
      }),
    );
  }

  messageCallback(response: { data: string }) {

    if (!response?.data) {
      return;
    }
    const dataRaw = JSON.parse(response.data);

    if (this.config.id === dataRaw.widgetId) {
      if (dataRaw.error || !dataRaw.data) {
        this.config.dataSource = mapWidgetData(dataRaw.defaultData);
        this.config.dataSource[0][0].text = this.NO_DATA_MESSAGE;
        this.cdr.detectChanges();

        return;
      }
      if (dataRaw.data) {
        this.useDefaultDataSource = false;
        this.config.dataSource = mapWidgetData(dataRaw.data);
        this.cdr.detectChanges();

        return;
      }
    }
  }

  errorCallback(error: any) {
    throw error;
  }

  defaultDataSource() {

    if (this.useDefaultDataSource) {

      if (this.widgetService.widgetType.DetailedNumbers === this.config.viewType) {
        this.config.dataSource = MOCK_DATA['widgetStyle'];
        this.config.dataSource[0][0].text = ucfirst(this.widgetService.selectedApp, this.NO_DATA_MESSAGE);
        this.cdr.detectChanges();
      }  else {
        this.config.dataSource = MOCK_DATA[this.config.viewType];
        this.config.dataSource[0][0].text = ucfirst(this.widgetService.selectedApp, this.NO_DATA_MESSAGE);
        this.cdr.detectChanges();
      }

    }
  }

  /** Gets line graph size */
  getGraphView(size) {
    return sizeOptions.find(sizeOption => sizeOption.size === size)?.graphView;
  }

  ngOnDestroy() {
    this.widgetService.webSocket.removeEventListener('message', this.messageCallback.bind(this));
    this.widgetService.webSocket.removeEventListener('open', this.openCallback.bind(this));
    this.widgetService.webSocket.removeEventListener('error', this.errorCallback.bind(this));
    this.destroy$.next();
    this.destroy$.complete();
  }
}
