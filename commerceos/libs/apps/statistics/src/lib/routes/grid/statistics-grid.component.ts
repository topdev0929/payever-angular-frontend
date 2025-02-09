import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Inject,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { cloneDeep } from 'lodash';
import { floor } from 'lodash-es';
import moment from 'moment';
import { BehaviorSubject, EMPTY, Subscription } from 'rxjs';
import { filter, map, skip, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  EnvironmentConfigInterface,
  EnvService,
  MessageBus,
  PE_ENV,
  TreeFilterNode,
  PeDestroyService,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { FolderService } from '@pe/folders';
import { PeGridMenuItem, PeGridSidenavService } from '@pe/grid';
import { PeFilterConditions, PeFilterType } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { FolderItem, PeFoldersContextMenuEnum } from '@pe/shared/folders';
import { PeContextMenuService } from '@pe/ui';
import { WindowService } from '@pe/window';

import { PeFilters } from '../../enums';
import { ActualPeStatisticsApi, PeWidgetService, ucfirst } from '../../infrastructure';
import { PeHeaderMenuService } from '../../misc/components/header-menu/header-menu.service';
import { EventList } from '../../statistics-header.service';

@Component({
  selector: 'pe-statistics-grid',
  templateUrl: './statistics-grid.component.html',
  styleUrls: ['./statistics-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeStatisticsGridComponent implements OnInit {
  /**
   * Used to store array of widget filters
   */
  widgetFilters = [];

  isMobile = window.innerWidth <= 720;
  isSidebarOpen = true;

  /** Wether the grid is in fullscreen mode */
  isFullScreenMode = false;
  private doesHaveDashboards = false;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private compiler: Compiler,
    private envService: EnvService,
    private overlayWidgetService: PeOverlayWidgetService,
    private apiService: ActualPeStatisticsApi,
    public widgetService: PeWidgetService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private contextMenu: PeContextMenuService,
    private peFolderService: FolderService,
    private confirmScreenService: ConfirmScreenService,
    private readonly destroyed$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    private messageBus: MessageBus,
    private headerMenu: PeHeaderMenuService,
    private windowService: WindowService,
    private headerService: PePlatformHeaderService,
  ) {
    /** Sets business id */
    this.localBusinessId = this.envService.businessId;
  }

  toolbar = {
    filterConfig: [
      {
        fieldName: PeFilters.Calendar,
        filterConditions: [
          PeFilterConditions.AfterDate,
          PeFilterConditions.BeforeDate,
          PeFilterConditions.BetweenDates,
        ],
        label: this.translateService.translate('statistics.filters.time_range'),
        type: PeFilterType.Date,
      },
      {
        fieldName: PeFilters.Currency,
        filterConditions: [PeFilterConditions.Is, PeFilterConditions.IsNot],
        options: [],
        label: this.translateService.translate('statistics.filters.currency'),
        type: PeFilterType.Option,
      },
    ],
  };

  /** Subscription */
  private subscriptions$: Subscription = new Subscription();

  /** Variable that stores business id */
  localBusinessId;

  editMode$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedDashboard;
  folders: FolderItem[] = [];
  isFoldersLoading$ = new BehaviorSubject<boolean>(false);

  sidenavMenu = {
    items: [
      {
        label: this.translateService.translate('statistics.action.add_dashboard'),
        value: 'add',
      },
    ],
  };

  setDefaultDashboard(e) {
    this.showConfirmationDialog(
      this.translateService.translate('statistics.confirm_dialog.subtitle_set_as_default_dashboard'),
    )
      .pipe(
        tap(() => {
          this.apiService
            .setAsDefault(e.data._id)
            .pipe(
              tap(() => {
                this.initDashboards();
              }),
              takeUntil(this.destroyed$),
            )
            .subscribe();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onDeleteDashboard(e) {
    this.apiService
      .deleteDashboardName(e.data._id)
      .pipe(
        tap(() => {
          this.initDashboards();
        }),
      )
      .subscribe();
  }

  onEditDashboard(e) {
    this.apiService
      .editDashboardName(e.data._id, { name: e.data.name })
      .pipe(
        tap(() => {
          this.initDashboards();
          e.apply();
        }),
      )
      .subscribe();
  }

  initDashboards(): void {
    this.isFoldersLoading$.next(true);
    this.apiService
      .getDashboards()
      .pipe(
        map((dashboard: TreeFilterNode[]) => {
          const folders = dashboard.map((item, index) => ({
            name: item.name,
            position: index + 1,
            _id: item._id,
            menuItems: [PeFoldersContextMenuEnum.Edit, PeFoldersContextMenuEnum.Open, PeFoldersContextMenuEnum.Delete],
            isDefault: item.isDefault,
          }));

          return folders;
        }),
      )
      .subscribe({
        next: folders => {
          this.selectedDashboard = folders.find(item => item.isDefault);
          this.folders = cloneDeep(folders);
          this.isFoldersLoading$.next(false);
          this.cdr.markForCheck();
        },
      });
  }

  selectSideNavMenu(menuItem: PeGridMenuItem) {
    if (menuItem.value === 'add') {
      this.onAddDashboard();
    }
  }

  toggleSidebar(): void {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.detectChanges();
  }

  /** Widgets observable */
  widgets$ = this.widgetService.widgets$;

  /** Default grid columns */
  gridCols = 7;

  /** Search items array */
  searchItems = [];

  setGridCols() {
    const gridWidth = window.innerWidth - 302;
    const cols = gridWidth / 152;
    let numberOfCols = floor(cols);
    if (numberOfCols % 2 !== 0) {
      numberOfCols -= 1;
    }

    if (numberOfCols < 2) {
      numberOfCols = 2;
    }

    this.gridCols = numberOfCols;
  }

  ngOnInit(): void {
    this.initDashboards();

    this.getDashboards();

    this.widgetService.widgetFilters$
      .pipe(
        skip(1),
        tap(filters => {
          /** Gets dashboard widgets */
          this.apiService.getWidgets(this.widgetService.currentDashboard?.id).subscribe((val: any) => {
            this.widgetService.webSocket.close();
            this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
            let widgets = val.map((widget: any) => {
              return {
                widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
                id: widget._id,
                viewType: widget.viewType,
                size: widget.size ?? this.widgetService.widgetSize.Large,
                edit: false,
              };
            });

            /** Filter logic */
            if (filters.length !== 0) {
              const filteredWidgets = widgets
                .filter(widget => {
                  const isFiltered = [];

                  widget.widgetSettings.forEach(settings => {
                    settings.forEach(setting => {
                      filters.forEach(filter => {
                        if (filter?.filter === 'channel') {
                          if (setting?.type === 'filter') {
                            if (setting?.value?.name === 'channel') {
                              if (filter?.search === setting?.value?.value) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          }
                        }
                        if (filter?.filter === 'apps') {
                          if (widget.widgetSettings[0][0]?.value.toLowerCase() === filter.search.toLowerCase()) {
                            isFiltered.push(true);
                          } else {
                            isFiltered.push(false);
                          }
                        }
                        if (filter?.filter === 'calendar') {
                          if (setting?.type === 'dateTimeRelative') {
                            if (filter?.search === setting?.value) {
                              isFiltered.push(true);
                            } else {
                              isFiltered.push(false);
                            }
                          }
                        }
                        if (filter?.filter === 'Time frame') {
                          if (filter?.search?.filter) {
                            if (setting?.type === 'dateTimeRelative') {
                              if (filter?.search?.filter === setting?.value) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          } else {
                            if (setting?.type === 'dateTimeFrom') {
                              if (moment(setting?.value).isAfter(moment(filter?.search?.from))) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                            if (setting?.type === 'dateTimeTo') {
                              if (filter?.searchText?.end !== null) {
                                if (moment(setting?.value).isBefore(moment(filter?.search?.to))) {
                                  isFiltered.push(true);
                                } else {
                                  isFiltered.push(false);
                                }
                              }
                            }
                          }
                        }
                        if (filter?.filter === 'currency') {
                          if (setting?.type === 'filter') {
                            if (setting?.value?.name === 'currency') {
                              if (setting?.value?.value === filter.search) {
                                isFiltered.push(true);
                              } else {
                                isFiltered.push(false);
                              }
                            }
                          }
                        }
                      });
                    });
                  });

                  if (isFiltered.length === 0) {
                    return false;
                  }

                  return isFiltered.every(value => value);
                })
                .map(widget => widget.id);

              if (filters.filter(item => item.filter === 'apps').length >= 1) {
                const appFilteredWidgets = widgets
                  .filter(widget => {
                    const appFilters = filters
                      .filter(item => item.filter === 'apps')
                      .map(element => element.searchText.toLowerCase());
                    if (appFilters.includes(widget.widgetSettings[0][0]?.value.toLowerCase())) {
                      return true;
                    }

                    return false;
                  })
                  .map(widget => widget.id);

                widgets = widgets.filter(widget => {
                  if (appFilteredWidgets.includes(widget.id)) {
                    return true;
                  }

                  return false;
                });
              }

              widgets.forEach((element, index) => {
                if (filteredWidgets.includes(element.id)) {
                  widgets[index].filtered = false;
                } else {
                  widgets[index].filtered = true;
                }
              });

              this.widgetService.widgets = widgets;
            } else {
              this.widgetService.widgets = widgets;
            }

            this.cdr.detectChanges();
          });
        }),
      )
      .subscribe();

    this.apiService.getCurrencyList().subscribe((res: any[]) => {
      this.toolbar.filterConfig = [
        ...this.toolbar.filterConfig.map((field: any) => {
          if (field.fieldName === PeFilters.Currency) {
            field.options = res.map(r => ({ label: r.name, value: r.code }));
          }

          return field;
        }),
      ];
      this.cdr.detectChanges();
    });

    this.messageBus
      .listen('toggle-sidebar')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.toggleSidebar();
      });

    this.messageBus
      .listen('edit-open')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.onEditOpen();
      });

    /** Refreshes component on widget change */
    this.widgetService.refreshWidget$.subscribe(() => {
      this.cdr.detectChanges();
    });
    /**
     * Widget filters observable
     * Upon widgetFilters change filter widgets
     */

    this.getWidgetTypeAndSize();

    this.setGridCols();

    this.peGridSidenavService.toggleOpenStatus$
      .pipe(
        tap((open: boolean) => {
          this.isSidebarOpen = open;
          this.headerService.assignConfig({
            isShowMainItem: this.isMobile && !open,
            leftSectionItems:
              !this.isMobile || !open
                ? [
                    {
                      title: this.translateService.translate('statistics.action.edit'),
                      class: 'statistics__header-button',
                      onClick: e => {
                        this.messageBus.emit(EventList.EDIT_OPEN, '');
                      },
                    },
                  ]
                : [],
          } as PePlatformHeaderConfig);
      }),
    ).subscribe();

    this.changeHeaderConfig(this.isMobile);
    this.windowService.width$.pipe(
      tap(width=> {
        this.setGridCols();
        this.isMobile = width <= 720;
        this.changeHeaderConfig(this.isMobile);
      }),
      takeUntil(this.destroyed$))
      .subscribe();

    this.cdr.detectChanges();
  }

  onEditOpen() {
    const data = {
      option: [
        {
          title: this.translateService.translate('statistics.action.edit'),
          list: [
            {
              label: this.translateService.translate('statistics.action.add_widget'),
              value: 'add_widget',
            },
          ],
        },
      ],
    };

    const dialogRef = this.headerMenu.open({
      data,
      disableClose: false,
      hasBackdrop: true,
      panelClass: 'edit-dialog',
      autoFocus: false,
    });
    dialogRef.afterClosed.subscribe(d => {
      if (d === 'add_widget') {
        this.onAddWidgetClick();
      }
    });
  }

  /**
   * On search change update search items array and widgetFilters subject
   *
   * @param e Gives search filter object
   */
  onSearchChanged(e) {
    this.searchItems = [...this.searchItems, e];

    this.widgetService.widgetFilters = [...this.widgetService.widgetFilters, e];
  }

  /** Opens Add widget overlay */
  onAddWidgetClick() {
    import('../../overlay').then(({ StatisticsOverlayModule, PeStatisticsOverlayComponent }) => {
      const moduleFactory = this.compiler.compileModuleAsync(StatisticsOverlayModule);
      moduleFactory.then(() => {
        this.widgetService.currentPage = 0;
        const onSaveSubject$ = new BehaviorSubject(null);
        const data = {};
        const headerConfig = {
          onSaveSubject$,
          title: this.translateService.translate('statistics.overlay_titles.add_widget'),
          backBtnTitle: this.translateService.translate('statistics.action.back'),
          backBtnCallback: () => {
            onSaveSubject$.next(false);
          },
          doneBtnTitle: this.translateService.translate('statistics.action.next'),
          doneBtnCallback: () => {
            onSaveSubject$.next(true);
          },
          onSave$: onSaveSubject$.asObservable(),
        } as any;
        this.widgetService.overlayRef = this.overlayWidgetService.open({
          data,
          headerConfig,
          component: PeStatisticsOverlayComponent,
          backdropClick: () => {
            this.showConfirmationDialog(this.translateService.translate('statistics.confirm_dialog.subtitle_exit'))
              .pipe(
                tap(() => {
                  this.widgetService.overlayRef.close();
                }),
                takeUntil(this.destroyed$),
              )
              .subscribe();

            return EMPTY;
          },
        });
      });
    });
  }

  /**
   * Selects dashboard based on dashboard item clicked
   * @param e Gives clicked dashboard item
   */
  dashboardClick(e) {
    this.selectedDashboard = e;
    if (e._id) {
      if (e._id !== this.widgetService.currentDashboard?.id) {
        this.getSelectedDashboard(e._id);

        return;
      }
    }
  }

  /**
   * Gets selected dashboard by dashboard id
   * @param dashboardId dashboard id
   */
  getSelectedDashboard(dashboardId) {
    this.apiService
      .getDashboardsById(dashboardId)
      .pipe(
        switchMap((dashboard: any) => {
          this.widgetService.currentDashboard = {
            id: dashboard._id,
            name: dashboard.name,
            isDefault: dashboard.isDefault,
            children: [],
            noToggleButton: true,
            image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
            data: {
              isDashboard: true,
              isFolder: true,
            },
          };

          return this.apiService.getWidgets(dashboardId);
        }),
        tap((widgets: any[]) => {
          this.widgetService.webSocket.close();
          this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
          this.apiService.getWidgetData().subscribe((widgetData: { channels: string[]; paymentMethods: string[] }) => {
            this.widgetService.appChannels = widgetData?.channels.map(channel => {
              return { label: this.translateService.translate(`statistics.channels.${channel}`), value: channel };
            });
            this.widgetService.paymentMethods = widgetData?.paymentMethods.map(paymentMethod => {
              const label = ucfirst(paymentMethod.replace(/_/g, ' '));

              return { label, value: paymentMethod };
            });

            this.cdr.detectChanges();
          });
          this.widgetService.widgets = [];
          this.widgetService.widgets = widgets.map((widget: any) => {
            return {
              id: widget._id,
              widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
              createdAt: widget.createdAt,
              updatedAt: widget.updatedAt,
              type: widget.type,
              viewType: widget.viewType,
              size: widget.size ?? this.widgetService.widgetSize.Large,
              edit: false,
            };
          });
        }),
      )
      .subscribe();
  }

  /** Gets dasbboards */
  getDashboards(): void {
    const dashboards$ = this.apiService.getDashboards();
    const sideNavDashboardOptions$ = dashboards$.pipe(
      map((res: any[]) => {
        const data = res.map((item: any) => {
          const tile: TreeFilterNode = {
            id: item._id,
            name: item.name,
            isDefault: item.isDefault,
            children: [],
            noToggleButton: true,
            image: `${this.env.custom.cdn}/icons/apps-icon.svg`,
            data: {
              isDashboard: true,
              isFolder: true,
            },
          };

          return tile;
        });

        return data;
      }),
    );
    const dashboardExistenceCheck$ = dashboards$.pipe(
      takeUntil(this.destroyed$),
      switchMap((dashboards: any[]) => {
        this.doesHaveDashboards = dashboards.find(dashboard => dashboard?.business?._id === this.localBusinessId);
        if (!this.doesHaveDashboards) {
          return this.apiService
            .createSingleDashboard({
              name: this.translateService.translate('statistics.action.initial_dashboard'),
            })
            .pipe(
              tap(res => {
                this.getDashboards();
              }),
            );
        }
        this.widgetService.apps = dashboards[0]?.availableTypes;

        const defaultDashboard = dashboards.filter(d => d.isDefault);

        return this.apiService.getWidgets(defaultDashboard.length > 0 ? defaultDashboard[0]._id : dashboards[0]._id);
      }),
      tap((widgets: any[]) => {
        this.apiService
          .getWidgetData()
          .pipe(takeUntil(this.destroyed$))
          .subscribe((widgetData: { channels: string[]; paymentMethods: string[] }) => {
            this.widgetService.appChannels = widgetData?.channels.map(channel => {
              return { label: this.translateService.translate(`statistics.channels.${channel}`), value: channel };
            });
            this.widgetService.paymentMethods = widgetData?.paymentMethods.map(paymentMethod => {
              const label = ucfirst(paymentMethod.replace(/_/g, ' '));

              return { label, value: paymentMethod };
            });
            this.cdr.detectChanges();
          });
        if (this.widgetService.webSocket) {
          this.widgetService.webSocket.close();
        }
        this.widgetService.webSocket = new WebSocket(this.env.backend.statisticsWs);
        this.widgetService.widgets =
          Array.isArray(widgets) &&
          widgets.map((widget: any) => {
            return {
              id: widget._id,
              widgetSettings: widget.widgetSettings.reduce((accu: any, setting: any) => [...accu, ...setting]),
              createdAt: widget.createdAt,
              updatedAt: widget.updatedAt,
              type: widget.type,
              viewType: widget.viewType,
              size: widget.size ?? this.widgetService.widgetSize.Large,
              edit: false,
            };
          });
      }),
    );

    this.subscriptions$.add(
      sideNavDashboardOptions$
        .pipe(
          tap(dashboard => {
            const currentDashboard = dashboard.filter(dash => dash.isDefault);
            this.widgetService.currentDashboard = currentDashboard.length > 0 ? currentDashboard[0] : dashboard[0];
          }),
          takeUntil(this.destroyed$),
        )
        .subscribe(),
    );

    dashboardExistenceCheck$.subscribe();
  }

  /**
   * Adds edit option on widget that is clicked
   *
   * @param widget Widget id of clicked widget
   */
  onClickToEdit(event, widget) {
    if (widget.edit === false) {
      const widgetIndex = this.widgetService.widgets.indexOf(widget);
      const newWidgets = this.widgetService.widgets;
      newWidgets.forEach((wid, index) => {
        newWidgets[index].edit = false;
      });
      newWidgets[widgetIndex].edit = true;
      this.widgetService.widgets = newWidgets;
      this.cdr.detectChanges();
    } else {
      const widgetIndex = this.widgetService.widgets.indexOf(widget);
      const newWidgets = this.widgetService.widgets;
      newWidgets[widgetIndex].edit = false;
      this.widgetService.widgets = newWidgets;
      this.cdr.detectChanges();
    }
  }

  createNewDashboard(e) {
    const node = e.data;
    this.apiService
      .createSingleDashboard({
        name: node.name,
      })
      .pipe(
        tap(() => {
          this.initDashboards();
          e.apply();
        }),
      )
      .subscribe();
  }

  onAddDashboard() {
    this.peFolderService.createFolder(this.translateService.translate('sidebar.folder_name'));
  }

  /** Gets widget types and sizes */
  getWidgetTypeAndSize() {
    this.apiService
      .getWidgetTypeData()
      .pipe(
        tap((res: any) => {
          this.widgetService.widgetSize = res.widgetSize.reduce((accu, item) => {
            accu[item] = item.toLowerCase();

            return { ...accu };
          }, {});

          this.widgetService.widgetType = res.widgetType.reduce((accu, item) => {
            accu[item] = item;

            return { ...accu };
          }, {});
        }),
      )
      .subscribe();
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

  /**
   * Opens add widget context menu
   *
   * @param event mouse click
   */
  openWidgetContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    const data = {
      title: 'Options',
      list: [{ label: this.translateService.translate('statistics.action.add_widget'), value: 'widget' }],
    };

    const dialogRef = this.contextMenu.open(event, { data });
    dialogRef.afterClosed.subscribe(d => {
      if (d === 'widget') {
        this.onAddWidgetClick();
      }
    });
  }

  private changeHeaderConfig(isMobile: boolean): void {
    setTimeout(() => {
      this.headerService.assignConfig({
        isShowDataGridToggleComponent: !isMobile,
        isShowMobileSidenavItems: isMobile,
        isShowSubheader: isMobile,
        isShowMainItem: isMobile && !this.isSidebarOpen,
        leftSectionItems:
          !isMobile || !this.isSidebarOpen
            ? [
                {
                  title: this.translateService.translate('statistics.action.edit'),
                  class: 'statistics__header-button',
                  onClick: e => {
                    this.messageBus.emit(EventList.EDIT_OPEN, '');
                  },
                },
              ]
            : [],
      } as PePlatformHeaderConfig);
    });
  }
}
