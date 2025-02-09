import { ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, Directive } from '@angular/core';
import { isArray, merge } from 'lodash-es';

import { RowAddonInterface, RowPropertyInterface } from '../../interfaces';
import { FieldDecorationType } from '../../types';

/**
 * @deprecated Should be removed after migration to fieldset
 */
@Directive()
export abstract class AbstractRowComponent implements OnChanges, OnInit {

  decoratorClassName: string = '';
  errorText: string | string[] = null;
  properties: RowPropertyInterface = {
    fieldType: null,
    formWidgetClassName: null,
    label: null, // TODO Remove label
    required: false,
    requiredTitle: null,
    rowClassName: null
  };
  value: string = '';

  @Input() addonAppend: RowAddonInterface = null;
  @Input() addonPrepend: RowAddonInterface = null;
  @Output() clickAddonAppend: EventEmitter<null> = new EventEmitter();
  @Output() clickAddonPrepend: EventEmitter<null> = new EventEmitter();

  @Input()
  set fieldDecorator(fieldDecoration: FieldDecorationType) {
    this.decoratorType = fieldDecoration || null;
    this.checkDecorator();
  }

  @Input()
  set fieldError(fieldError: string | string[]) {
    this.errorText = isArray(fieldError) ? (fieldError as string[]).join(', ') : fieldError;
    this.checkDecorator();
  }

  @Input()
  set fieldValue(value: string) {
    this.value = value;
    this.updateElementClassList();
  }

  @Input()
  set rowProperty(rowProperty: RowPropertyInterface) {
    merge(this.properties, rowProperty || {});
    this.setElementClassList();
    this.checkDecorator();
  }

  protected decoratorType: FieldDecorationType = null;
  protected elementClassName: string;
  protected htmlElement: HTMLElement;

  constructor(
    protected elementRef: ElementRef
  ) {}

  ngOnChanges(): void {
    this.checkDecorator();
  }

  ngOnInit(): void {
    this.htmlElement = this.elementRef.nativeElement;
    this.elementClassName = this.htmlElement.className;
    this.setElementClassList();
    this.checkDecorator();
  }

  get hasTextAddonAppend(): boolean {
    return !(Boolean(this.addonAppend.button) || Boolean(this.addonAppend.iconId));
  }

  get hasTextAddonPrepend(): boolean {
    return !(Boolean(this.addonPrepend.button) || Boolean(this.addonPrepend.iconId));
  }

  onClickAddonAppend(): void {
    this.clickAddonAppend.emit();
  }

  onClickAddonPrepend(): void {
    this.clickAddonPrepend.emit();
  }

  protected checkDecorator(): void {
    let className: string = '';
    if ( this.errorText ) {
      className = 'has-error';
    }
    else if ( this.decoratorType ) {
      className = `has-${this.decoratorType}`;
    }
    this.decoratorClassName = className;
    this.updateElementClassList();
  }

  protected setElementClassList(): void {
    if ( !this.htmlElement ) {
      return;
    }

    this.htmlElement.className = this.elementClassName;

    if ( this.properties.rowClassName ) {
      this.properties.rowClassName.split(' ').forEach((className: string) => this.htmlElement.classList.add(className));
    }

    if ( this.properties.required ) {
      this.htmlElement.classList.add('required');
      if ( this.properties.requiredTitle ) {
        this.htmlElement.title = this.properties.requiredTitle;
      }
    } else {
      this.htmlElement.classList.remove('required');
      this.htmlElement.removeAttribute('title');
    }

    if ( Boolean(this.properties.fieldType) ) {
      this.htmlElement.classList.add(`field-${this.properties.fieldType}`);
    }

    this.updateElementClassList();
  }

  protected updateElementClassList(): void {
    if (!this.htmlElement) {
      return;
    }

    if ( this.value && this.properties.label ) { // TODO Remove label
      this.htmlElement.classList.add('filled');
    } else {
      this.htmlElement.classList.remove('filled');
    }
  }
}
