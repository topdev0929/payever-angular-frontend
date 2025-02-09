import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Select } from '@ngxs/store';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  fromEvent,
  merge,
  Observable,
  ReplaySubject,
  Subject,
  timer,
} from 'rxjs';
import { filter, map, startWith, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebScreen, PebShop, PebViewElement } from '@pe/builder/core';
import { elementModels } from '@pe/builder/editor-utils';
import { PebRendererService } from '@pe/builder/renderer';
import { PebEditorState, PebOptionsState } from '@pe/builder/state';
import { PeDataGridFilter, TreeFilterNode } from '@pe/common';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { SidebarFiltersWrapperComponent } from '@pe/sidebar';


import {
  GridExpandAnimation,
  MobileSidebarAnimation,
  newSidebarAnimation,
  SidebarAnimation,
  SidebarAnimationStates,
} from './sidebar.animation';

@Component({
  selector: 'peb-review-publish',
  templateUrl: './review-publish.component.html',
  styleUrls: ['./review-publish.component.scss'],
  animations: [newSidebarAnimation, SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebReviewPublishComponent implements OnInit, OnDestroy {
  private readonly gridAnimationStateStream$ =
    new BehaviorSubject<SidebarAnimationStates>(SidebarAnimationStates.Default);

  readonly gridAnimationState$: Observable<SidebarAnimationStates> = this.gridAnimationStateStream$.asObservable();

  destroy$ = new Subject<void>();

  @ContentChildren(SidebarFiltersWrapperComponent) sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  isSidebarClosed = window.innerWidth <= 720;

  @ViewChild('draftPreview', { static: false }) draftPreview: ElementRef<HTMLElement>;
  @ViewChild('currentVersionPreview', { static: false }) currentVersionPreview: ElementRef<HTMLElement>;
  @ViewChild('versions', { static: true }) versionsContainer: ElementRef<HTMLElement>;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  @ViewChild('scrollbar', { static: false }) scrollbar: ElementRef<HTMLElement>;

  currentPage: any;

  themeId: string;
  activeNodeId: string;
  fullScreens: boolean[];
  totalPages: any;

  private headerConfig: PePlatformHeaderConfig;

  filters: PeDataGridFilter[] = [];

  private readonly treeData$ = new BehaviorSubject<TreeFilterNode[]>([]);

  get treeData() {
    return this.treeData$.getValue();
  }

  set treeData(data: TreeFilterNode[]) {
    this.treeData$.next(data);
  }

  formGroup = this.formBuilder.group({
    tree: [[]],
  });

  draftSnapshot: any;
  publishedTheme: PebShop;

  readonly preview$: Subject<{ current: any, published: PebShop }> = new Subject();
  readonly selectedVersion$ = new ReplaySubject<string>(1);
  readonly screenChanging$ = new Subject<boolean>();

  currentElements$ = new ReplaySubject<PebViewElement[]>(1);
  publishedElements$ = new ReplaySubject<PebViewElement[]>(1);

  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;

  scale$ = new ReplaySubject<number>(1);

  transform$ = this.scale$.pipe(map(scale => `scale(${scale})`));
  width$ = this.screen$.pipe(filter(screen => !!screen), map(screen => screen.width));

  updateSize$ = new ReplaySubject<void>(1);


  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: any,
    public dialogRef: MatDialogRef<PebReviewPublishComponent>,
    private formBuilder: FormBuilder,
    private platformHeader: PePlatformHeaderService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private rendererService: PebRendererService,
  ) {
  }

  ngOnInit(): void {
    this.fullScreens = [false, false];

    this.initPages();
    this.createHeader();

    combineLatest([
      fromEvent(window, 'resize').pipe(startWith(null)),
      this.updateSize$.pipe(startWith(null)),
    ]).pipe(
      withLatestFrom(this.screen$, this.screens$),
      tap(([_, screen]) => {
        this.scale$.next(1 / (screen.width / this.scrollbar.nativeElement.clientWidth));
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    merge(
      this.selectedVersion$.pipe(withLatestFrom(this.screen$)),
      this.screen$.pipe(
        withLatestFrom(this.selectedVersion$),
        map(([screen, selectedVersion]) => [selectedVersion, screen]),
      ),
    ).pipe(
      tap(() => {
        this.currentElements$.next([]);
        this.publishedElements$.next([]);
      }),
      switchMap(() => {
        return EMPTY;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  async getPayload(elements, screen: PebScreen, language, screens: PebScreen[]) {
    const models = elementModels([...elements.values()], screen, language, screens).elements;
    const payload = await Promise.all(models.map(async (elm) => {
      return this.rendererService.renderElement(elm);
    }));

    return payload;
  }

  createHeader(): void {
    const rightSectionItems = [
      {
        title: 'Close',
        class: 'dialog-btn',
        onClick: () => this.dialogRef.close(null),
      },
      {
        title: 'Publish',
        class: 'dialog-btn active',
        onClick: () => this.dialogRef.close(true),
      },
    ];
    let isShowDataGridToggleComponent = true;

    if (!this.totalPages.length) {
      rightSectionItems.splice(1, 1);
      isShowDataGridToggleComponent = false;
    }

    this.headerConfig = this.platformHeader.config;
    this.platformHeader.setConfig({
      isShowDataGridToggleComponent,
      rightSectionItems,
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: undefined,
      isShowSubheader: false,
      mainItem: null,
      isShowMainItem: false,
      closeItem: {
        title: 'Close',
        onClick: () => this.dialogRef.close(null),
      },
      isShowCloseItem: false,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
      showDataGridToggleItem: {
        iconSize: '24px',
        iconType: 'vector',
        onClick: this.onToggleSidebar.bind(this),
        isActive: true,
        isLoading: true,
        showIconBefore: true,
      },
      leftSectionItems: [
        {
          title: `Screen`,
          class: 'dialog-btn screen-btn',
          onClick: () => this.menuTrigger.openMenu(),
        },
      ],
    });

  }

  initPages(): void {
    this.totalPages = this.dialogData.totalPages;

    if (!this.totalPages.length) {
      return;
    }

    this.draftSnapshot = this.dialogData.current;
    this.publishedTheme = this.dialogData.published;

    this.treeData = this.totalPages.map((page) => {
      const fullTime = new Date(page.updatedAt).toLocaleTimeString('en-UK');

      return {
        name: page.name,
        id: page.id,
        data: {
          date: new Date(page.updatedAt).toLocaleDateString('en-UK'),
          time: fullTime.slice(0, fullTime.length - 3),
        },
      };
    });
    this.cdr.detectChanges();

    this.activeNodeId = this.totalPages[0].id;
    this.selectedVersion$.next(this.activeNodeId);
  }

  ngOnDestroy(): void {
    if (this.headerConfig) {
      this.platformHeader.setConfig(this.headerConfig);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSelectPage(page: TreeFilterNode, event: Event): void {
    event.stopPropagation();
    this.activeNodeId = page.id;
    this.selectedVersion$.next(this.activeNodeId);
  }

  getActiveNode(node: TreeFilterNode): boolean {
    return node?.id === this.activeNodeId;
  }

  onEdit(): void {
  }

  onFullscreenChange(index: number): void {
    const element = index ? this.draftPreview : this.currentVersionPreview;

    let display = 'flex';
    if (!this.fullScreens[index]) {
      this.onToggleSidebar(true);
      display = 'none';
    } else {
      this.onToggleSidebar(false);
    }

    this.fullScreens[index] = !this.fullScreens[index];
    this.renderer.setStyle(element.nativeElement, 'display', display);

    timer(400).pipe(
      switchMap(() => {
        this.updateSize$.next();
        this.cdr.detectChanges();

        return timer(50);
      }),
      tap(() => {
        // Hack for triggering change detection
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ctrl' }));
      }),
    ).subscribe();
  }

  onToggleSidebar(close?: boolean): void {
    this.isSidebarClosed = close ?? !this.isSidebarClosed;
    timer(400).pipe(
      tap(() => this.updateSize$.next()),
    ).subscribe();
  }

  isActiveNode(node: TreeFilterNode): boolean {
    return node.id === this.activeNodeId;
  }

  onBack(): void {
    this.dialogRef.close(null);
  }

  onView(screenKey: string): void {
    this.screens$.pipe(
      map(screens => screens.find(scr => scr.key === screenKey)),
      filter(screen => !!screen),
      tap((screen) => {
        const leftSectionItems = [
          {
            title: screen.title,
            class: 'dialog-btn screen-btn',
            onClick: () => this.menuTrigger.openMenu(),
          },
        ];

        this.platformHeader.assignConfig({
          ...this.platformHeader.config,
          leftSectionItems,
        });

        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}
