import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { PebElementType } from '@pe/builder/core';
import { ImageSize } from '@pe/builder/old';
import { getPebSize, PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebSecondaryTab } from '@pe/builder/state';


@Component({
  selector: 'peb-editor-grid-sidebar',
  templateUrl: './grid.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './grid.sidebar.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorGridSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementsState.selected) readonly selectedElements$!: Observable<PebElement[]>;

  @ViewChild('cellSidebarSlot', { read: ViewContainerRef }) cellSidebarSlot: ViewContainerRef;
  @ViewChild('tabSidebarSlot', { read: ViewContainerRef }) tabSidebarSlot: ViewContainerRef;

  @Output() cellTypeChange = new EventEmitter<PebElementType>();

  activeTab = PebSecondaryTab.Style;

  form: FormGroup;
  limits = new BehaviorSubject<any>({
    height: {
      min: 1,
      max: 100,
    },
  });

  private readonly destroy$ = new Subject<void>();

  get isCellElement$(): Observable<boolean> {
    return this.selectedElements$.pipe(
      map(elements => elements.every(elm => elm.parent?.type === PebElementType.Grid)),
    );
  }

  get showFontForm(): boolean {
    return true;
  }

  constructor(
    private readonly cfr: ComponentFactoryResolver,
    private readonly injector: Injector,
    private readonly fb: FormBuilder,
    public readonly cdr: ChangeDetectorRef,
  ) {
  }

  getFirstCellDimensions(cells: PebElement[] = []) {
    return {
      firstCellHeight: 0,
      firstCellWidth: 0,
    };
  }

  setDimensionsLimits(element): void {
    const rowCount = element.data.rowCount;
    const maxHeight = element.parent.styles.height - (getPebSize(element.styles?.position.top).value ?? 0);

    this.limits.next({
      height: {
        min: 1,
        max: maxHeight / rowCount,
      },
    });

    this.form.get('dimensions').get('height').setValidators([
      Validators.min(this.limits.value.height.min),
      Validators.max(this.limits.value.height.max),
    ]);
  }

  ngOnInit(): void {
    this.selectedElements$.pipe(
      tap((elements) => {
        const grid = elements[0];
        const { firstCellHeight, firstCellWidth } = this.getFirstCellDimensions();
        const gridData = grid.data ?? {};
        this.form = this.fb.group({
          grid: this.fb.group({
            elType: this.fb.control(null),
          }),
          spacing: this.fb.control(gridData.spacing),
          borderOptions: this.fb.group({
            option: [gridData.borderOptions ?? null],
            color: [gridData.borderColor ?? '#000000'],
            width: [gridData.borderWidth ?? 1],
          }),
          cellBorderOptions: this.fb.group({
            option: [null],
            color: ['#000000'],
            width: [1],
          }),
          dimensions: this.fb.group({
            height: [firstCellHeight],
            width: [firstCellWidth],
          }),
          fullHeight: this.fb.control(grid.styles.dimension?.fullDeviceHeight ?? false),
          openInOverlay: this.fb.control(gridData.openInOverlay ?? false),
          image: this.fb.group({
            size: this.fb.control(gridData.imageSize ?? ImageSize.OriginalSize),
            scale: this.fb.control(gridData.imageScale ?? 100, { updateOn: 'change' }),
          }),
        }, { updateOn: 'blur' });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
