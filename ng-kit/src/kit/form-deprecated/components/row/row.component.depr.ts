import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { merge, isArray } from 'lodash-es';

import { DevModeService } from '../../../dev';

import { RowPropertyInterface } from '../../interfaces';
import { FieldDecorationType } from '../../types';

const DECORATIONS: FieldDecorationType[] = ['error', 'warning', 'success'];

/**
 * @deprecated Should be removed after migration to fieldset
 */
@Component({
  selector: 'pe-form-row',
  templateUrl: 'row.component.depr.html',
  styleUrls: ['./row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormRowComponent implements OnChanges, OnInit {
  decoratorClassName: string = '';
  errorText: string | string[] = null;
  properties: RowPropertyInterface = {
    addonAppend: null,
    addonAppendBtn: null,
    addonPrepend: null,
    addonPrependBtn: null,
    formWidgetClassName: null,
    label: null, // TODO Remove
    required: false,
    requiredTitle: null,
    rowClassName: null,
    rowType: 'default'

  };
  value: string = '';

  @Input() rowProperty: RowPropertyInterface = null;
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

  private decoratorType: FieldDecorationType = null;

  constructor(
    private elementRef: ElementRef,
    private devMode: DevModeService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.checkDecorator();
  }

  ngOnInit(): void {
    if (this.devMode.isDevMode() ) {
      // tslint:disable-next-line no-console
      console.warn('<pe-form-row> is DEPRECATED. Please use <pe-form-row-default> or <pe-form-row-table>');
    }
    merge(this.properties, this.rowProperty || {});
    this.setElementClassList();
    this.checkDecorator();
  }

  get addonAppendBtnClass(): string {
    return this.properties.addonAppendBtn ? `btn-${this.properties.addonAppendBtn}` : '';
  }

  get addonPrependBtnClass(): string {
    return this.properties.addonPrependBtn ? `btn-${this.properties.addonPrependBtn}` : '';
  }

  get isDefault(): boolean {
    return this.properties.rowType === 'default';
  }

  get hasAddon(): boolean {
    return Boolean(this.properties.addonPrepend || this.properties.addonAppend);
  }

  get formWidgetClassName(): string {
    const className: string[] = this.properties.formWidgetClassName ? this.properties.formWidgetClassName.split(' ') : [];
    if ( this.isDefault && this.properties.label ) { // TODO Remove label
      className.push('labeled');
    }
    if ( this.properties.addonAppend || this.properties.addonPrepend ) {
      className.push('input-group');
    }
    return className.join(' ');
  }

  onClickAddonAppend(event: Event): void {
    this.clickAddonAppend.emit();
    event.preventDefault();
  }

  onClickAddonPrepend(event: Event): void {
    this.clickAddonPrepend.emit();
    event.preventDefault();
  }

  private checkDecorator(): void {
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

  private setElementClassList(): void {
    const el: HTMLElement = this.elementRef.nativeElement;
    if ( this.isDefault ) {
      el.classList.add('form-group');
    }
    else {
      el.classList.remove('form-group');
    }
    if ( this.properties.rowClassName ) {
      this.properties.rowClassName.split(' ').forEach((className: string) => el.classList.add(className));
    }
    if ( this.properties.required ) {
      el.classList.add('required');
      el.title = this.properties.requiredTitle;
    }
    this.updateElementClassList();
  }

  private updateElementClassList(): void {
    const el: HTMLElement = this.elementRef.nativeElement;
    if (this.value && this.properties.label) { // TODO Remove label
      el.classList.add('filled');
    }
    else {
      el.classList.remove('filled');
    }
    if ( !this.isDefault ) {
      DECORATIONS.forEach((decoration: FieldDecorationType) => el.classList.remove(`has-${decoration}`));
      if ( this.decoratorClassName ) {
        el.classList.add(this.decoratorClassName);
      }
    }
  }
}
