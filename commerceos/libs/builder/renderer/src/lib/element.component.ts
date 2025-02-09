import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { PebRenderContainer, PebViewElement, PebViewStyle } from '@pe/builder/core';
import { PebQuillRenderer } from '@pe/builder/delta-renderer';
import { PebViewElementInitAction } from '@pe/builder/view-actions';


@Component({
  selector: 'peb-element',
  template: `
    <div #text class="text ql-editor" *ngIf="def.text && !editMode" [pebStyle]="def.style.inner" [innerHtml]="def.textHTML"></div>
    <peb-vector-element *ngIf="def.type === 'vector'" [vector]="def.vector" [id]="def.id" [container]="container"></peb-vector-element>
    <peb-fill *ngIf="def.fill && def.fill.type!=='solid' && def.fill.type!=='gradient'" [element]="def" [fill]="def.fill" [container]="container"></peb-fill>
    <peb-element-layout *ngIf="def.layout" [def]="def"></peb-element-layout>
  `,
  styles: [
    `
    .text {
      position: relative;
      flex-direction: column;
      display: flex;
      width: 100%;
      height: 100%;
      z-index: 2;

      p {
        margin:0;
        padding:0;
      }
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebElementComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('text') textContainer: ElementRef;
  @Input() def: PebViewElement<PebViewStyle>;
  @Input() container!: PebRenderContainer;
  @Input() editMode: boolean;
  @Output() relocate = new EventEmitter<string>();

  @HostBinding('id')
  get name(): string {
    return this.def.name;
  }

  @HostBinding('attr.peb-id')
  get id(): string {
    return this.def.id;
  }

  @HostBinding('attr.qa-element')
  get qaElement(): string {
    return this.def.type;
  }

  private destroy$ = new Subject<void>();

  constructor(
    public readonly elmRef: ElementRef,
    private readonly store: Store,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!changes.def?.previousValue) {
      return;
    }
    if (!changes.def.firstChange && changes.def.previousValue.parent !== changes.def.currentValue.parent) {
      this.relocate.emit(this.def.id);
    }
  }

  ngAfterViewInit(): void {
    if (this.container) {
      this.store.dispatch(new PebViewElementInitAction(
        {
          ...this.def,
          text: this.def.text ? PebQuillRenderer.render(this.def.text) : undefined,
          container: this.container,
          children: [...this.def.children ?? []],
        },
        this.container.key,
        this.elmRef.nativeElement,
      ));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.elmRef.nativeElement.parentNode.removeChild(this.elmRef.nativeElement);
  }

  getSize(): { width: number; height: number } {
    const computedStyles = getComputedStyle(this.elmRef.nativeElement);
    const width = +computedStyles.width.replace('px', '');
    const height = +computedStyles.height.replace('px', '');

    return { width, height };
  }
}
