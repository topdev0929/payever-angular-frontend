import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding, HostListener,
  Injector,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MAT_SELECT_SCROLL_STRATEGY_PROVIDER } from '@angular/material/select';
import { OVERLAY_PROVIDERS } from '@angular/cdk/overlay';

import { TranslateService } from '../../../../i18n';
import { AbstractFieldComponent } from '../../../../form-core/components/abstract-field';
import { SelectChangeEvent, SelectOptionGroupInterface, SelectOptionInterface } from '../../interfaces';
import { parseTestAttribute } from '../../../../../kit/utils';
import { AutoCompleteChipsAddOptionInterface, AutocompleteOption } from '../../../autocomplete/interfaces';
import { timer } from 'rxjs';

@Component({
  selector: 'pe-select',
  templateUrl: './select.component.html',
  encapsulation: ViewEncapsulation.None,
  providers: [
    MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
    OVERLAY_PROVIDERS
  ]
})
export class SelectComponent extends AbstractFieldComponent {

  parseAttribute = parseTestAttribute;
  hiddenOptions: string[] = [];

  @HostBinding('class.pe-select') hostClass: boolean = true;
  @Input()
  set formStyle(formStyle: string) {
    switch (formStyle) {
      case 'dark':
        this.panelClass = 'mat-select-dark';
        break;
      case 'transparent':
        this.panelClass = 'mat-select-transparent';
        break;
      default:
        break;
    }
  }
  @Input() disableOptionCentering: boolean;
  @Input() label: string;
  @Input() multiple: boolean;
  @Input() options: SelectOptionInterface[];
  @Input() panelClass: string;
  @Input() placeholder: string;
  @Input() rawLabels: boolean;
  @Input() singleLineMode?: boolean;
  @Input() singleLineMoreText?: string;
  @Output() openedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() valueChange: EventEmitter<SelectChangeEvent> = new EventEmitter<SelectChangeEvent>();

  @Input() optionGroups: SelectOptionGroupInterface[];
  @Input() addOptionButton: AutoCompleteChipsAddOptionInterface;
  @Input() optionClass?: string;

  @ViewChild('chipListContainer', { read: ElementRef }) chipListContainer: ElementRef;
  @ViewChildren('chipItem', {read: ElementRef}) chipElements: QueryList<ElementRef>;

  private translateService: TranslateService = this.injector.get(TranslateService);

  constructor(protected injector: Injector, private cd: ChangeDetectorRef) {
    super(injector);
  }

  @HostListener('window:resize') onResize() {
    this.checkIsHidden();
  }

  get moreTextConcat(): string {
    if (!this.hiddenOptions.length) {
      return '';
    }
    return this.singleLineMoreText ? `+ ${this.hiddenOptions.length} ${this.singleLineMoreText}` : '...';
  }

  get selectedOptions(): string[] {
    return this.multiple ? this.formControl.value : [this.formControl.value];
  }

  isColorType(selectedValue: string): boolean {
    const option = this.options.find(({value}) => value === selectedValue);
    return !!option && !!option.hexColor;
  }

  getOptionOpacity(option: string): 1 | 0 {
    const isHidden = this.hiddenOptions.some((val: string) => val === option);
    return isHidden ? 0 : 1;
  }

  getOptionQaId(option: SelectOptionInterface, postfix: string = ''): string {
    postfix = postfix ? `-${postfix}` : '';
    return `${this.controlQaId}-${this.parseAttribute(option.value)}${postfix}`;
  }

  onSelectChange(event: MatOptionSelectionChange, value: any): void {
    if (event.isUserInput) {
      this.valueChange.emit({ value });
    }
  }

  onOpenedChange(opened: boolean): void {
    if (opened) {
      this.markAsUntouched();
    }
    this.checkIsHidden();
  }

  getGroupedItems(group: SelectOptionGroupInterface): SelectOptionInterface[] {
    return this.options.filter(o => o.groupId === group.id);
  }

  onRemove (option: string): void {
    if ((this.formControl.value as AutocompleteOption[]).indexOf(option) !== -1) {
      const newValue: AutocompleteOption[] = this.formControl.value
        .filter((item: AutocompleteOption) => item !== option);
      this.formControl.setValue(newValue);
      this.valueChange.emit({ value: newValue });
    }
    this.checkIsHidden();
  }

  getOptionColor (selectedOption: string): string {
    const option = this.options.find(({value}) => value === selectedOption);
    return option && option.hexColor || '';
  }

  translate(key: string): string {
    return this.translateService.hasTranslation(key) ? this.translateService.translate(key) : key;
  }

  private isOverflow(el: HTMLElement): boolean {
    const {offsetLeft: containerOffsetLeft, offsetWidth: containerOffsetWidth} = this.chipListContainer.nativeElement;
    const {offsetLeft: elOffsetLeft, offsetWidth: elOffsetWidth} = el;
    return elOffsetLeft + elOffsetWidth > containerOffsetLeft + containerOffsetWidth;
  }

  private checkIsHidden(): void {
    if (!this.singleLineMode || !this.chipElements.length) {
      return;
    }
    timer().subscribe(_ => {
      this.hiddenOptions = this.selectedOptions.filter((str: string) => {
        const el = this.chipElements.find((el: ElementRef) => el.nativeElement.getAttribute('value') === str);
        if (!el) {
          return false;
        }
        return this.isOverflow(el.nativeElement);
      });
      this.cd.detectChanges();
    });
  }
}
