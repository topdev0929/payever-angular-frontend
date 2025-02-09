import { AfterViewInit, Directive, ElementRef, HostBinding, Input } from '@angular/core';
import { Store } from '@ngxs/store';

import { PebRenderElementModel } from '@pe/builder/core';
import { PebViewElementInitAction } from '@pe/builder/view-actions';


@Directive({
  selector: '[pebClientElement]',
})
export class PebClientElementDirective implements AfterViewInit {

  @Input() pebClientElement!: PebRenderElementModel;

  @HostBinding('id')
  get id(): string | undefined {
    return this.pebClientElement?.id;
  }

  @HostBinding('attr.name')
  get name(): string | undefined {
    return this.pebClientElement?.name;
  }

  @HostBinding('attr.peb-type')
  get type(): string | undefined {
    return this.pebClientElement?.type;
  }


  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private store: Store,
  ) { }

  ngAfterViewInit(): void {
    this.store.dispatch(new PebViewElementInitAction(
      this.pebClientElement,
      this.pebClientElement.container?.key,
      this.elementRef.nativeElement,
    ));
  }
}
