import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  Renderer2,
  ViewChildren,
} from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { PebRenderContainer, PebViewElement, PebViewStyle } from '@pe/builder/core';
import { PebEditorState, PebEditTextModel } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { PebElementComponent } from './element.component';
import { PebQueryViewBBoxAction, PebUpdateViewBBoxAction } from './renderer.actions';


@Component({
  selector: 'peb-renderer',
  template: `
    <div *ngFor="let elm of elements; trackBy: trackBy" style="display: contents;">
      <peb-element
        [pebStyle]="elm?.style?.host"
        [def]="elm"
        [pebEditorAnimation]="elm"
        [editMode]="(editTextElementId$|async)===elm.id"
        (relocate)="relocateElement($event)"
        (viewInitialized)="elementInitialized.next($event)"
        [container]="container"
      ></peb-element>
    </div>
    <ng-content></ng-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebRendererComponent implements AfterViewInit, AfterViewChecked {

  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  @ViewChildren(PebElementComponent) components!: QueryList<PebElementComponent>;

  @Input() elements: Array<PebViewElement<PebViewStyle>> = [];
  @Input() container: PebRenderContainer;

  @Output() viewInitialized = new EventEmitter<void>();

  reportElementIds: string[] | undefined = [];

  editTextElementId$ = this.editText$.pipe(
    map((model: PebEditTextModel) => model.enabled ? model.element?.id : undefined),
  );

  queryViewBBox$ = this.actions.pipe(
    ofActionDispatched(PebQueryViewBBoxAction),
    tap((action: PebQueryViewBBoxAction) => {
      this.reportElementIds = action.elementIds;
    }),
  );

  private portals: Map<string, PebElementComponent>;

  constructor(
    public readonly elmRef: ElementRef,
    private readonly actions: Actions,
    private readonly store: Store,
    private readonly renderer: Renderer2,
    private readonly destroy$: PeDestroyService,
  ) {
    this.queryViewBBox$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngAfterViewChecked(): void {
    this.reportElementSizes();
  }

  ngAfterViewInit(): void {
    this.viewInitialized.next();

    this.portals = new Map(this.components.map(cmp => [cmp.def.id, cmp]));
    this.relocateChildren();

    this.components.changes.pipe(
      tap(() => {
        this.portals = new Map(this.components.map(cmp => [cmp.def.id, cmp]));
        this.relocateChildren();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  trackBy = (index: number, item: PebViewElement<PebViewStyle>): string => {
    return item.id;
  };

  private reportElementSizes() {
    if (!this.portals || !this.reportElementIds?.length) {
      return;
    }

    const updates = {};
    this.reportElementIds.forEach((id) => {
      const component = this.portals.get(id);
      component && (updates[id] = component.getSize());
    });

    this.store.dispatch(new PebUpdateViewBBoxAction(updates));
    this.reportElementIds = [];
  }

  private relocateChildren(): void {
    this.components.forEach((element) => {
      for (const child of element.def.children) {
        this.relocateElement(child);
      }
    });
  }

  relocateElement(id: string): void {
    const elm = this.portals?.get(id);
    const parent = !elm?.def.parent?.id
      ? this.elmRef.nativeElement
      : this.portals.get(elm.def.parent?.id)?.elmRef.nativeElement;
    if (elm && parent) {
      this.renderer.appendChild(parent, elm.elmRef.nativeElement);
    }
  }
}

