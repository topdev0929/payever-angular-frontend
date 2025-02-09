import {
  Directive,
  Injector,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { LayoutType } from '../enums/layout-type.enum';

@Directive()
export abstract class BaseSelector implements OnInit {

  @ViewChild('container', { read: ViewContainerRef, static: true })
  protected readonly viewContainerRef: ViewContainerRef;

  @Input() set layoutType(value: LayoutType) {
    this._layoutType = value;
    this.viewContainerRef.clear();
    this.loadComponent();
  }

  get layoutType(): LayoutType {
    return this._layoutType;
  }

  private _layoutType: LayoutType;

  constructor(
    protected injector: Injector,
  ) {}

  ngOnInit(): void {
    this.loadComponent();
  }

  public abstract loadComponent(): void;
}
