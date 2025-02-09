import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { EnvService } from '@pe/common';
import { InvoiceEnvService } from '../../services/invoice-env.service';

let uniqueId = 0;

@Component({
  selector: 'peb-product-select',
  templateUrl: './product-picker.html',
  styleUrls: ['./product-picker.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebProductPickerComponent implements OnInit {
  constructor(
    private router: Router,
    @Inject(EnvService) protected envService: InvoiceEnvService,
    private cdr: ChangeDetectorRef,
    private readonly viewRef: ViewContainerRef
  ) {}
  @Input() placeholder: string;
  /** Product picker data */
  @Input() set data (val: any) {
    this.items = val;
    this.filteredOptions = this.customFilter('');
    this.cdr.detectChanges();
  };
  /** Product picker filter by */
  @Input() filterBy = 'name';
  @Input() buttonName = 'Add items';
  @Input() label = 'Item';
  @Input() multiple = true;
  /** Button function */
  @Input() buttonFunction: () => void = () => {};
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  inputId = `peb-product-picker-${(uniqueId += 1)}`;

  private items = [];
  /** Autocomplete options shown */
  filteredOptions = [];

  /** Added products */
  addedItems = [];

  productWidth = 410;
  optionSelected;

  @Output() onInput: EventEmitter<any> = new EventEmitter<any>();
  /** Emits on products list changed */
  @Output() changed: EventEmitter<any> = new EventEmitter<any>();
  /** Emits on touch */
  @Output() touched: EventEmitter<any> = new EventEmitter<any>();

  /** Input ref */
  @ViewChild('input') inputRef: ElementRef;
  @ViewChild('productPickerWrapper', { static: true }) wrapperRef: ElementRef;

  ngOnInit() {}

  /** Emits changes */
  emitChanges() {
    this.touched.emit();
    this.changed.emit(this.addedItems);
    this.cdr.detectChanges();
  }

  /** Filters autocorrect options on keypress. Adds on enter. */
  onKey(event) {
    // this.filteredOptions = this.customFilter(event.target.value);
    this.touched.emit();

    if (event.key === 'Enter') {
      this.optionSelected = this.items[0];
      this.addSelectedProduct(this.inputRef.nativeElement.value);
      this.autocomplete.closePanel()
    }
  }

  displayFn(product): string {
    return product.name;
  }

  optionSelect(event) {
    this.touched.emit();
    this.optionSelected = event.option.value;
  }

  addProduct() {
    this.buttonFunction();
    this.emitChanges();
  }

  onRemoveProduct($event, i) {
    if (this.addedItems[i].hasOwnProperty('id')) {
      this.addedItems = this.addedItems.filter((element) => {
        return element.id !== this.addedItems[i].id;
      });
    }
    this.emitChanges();
  }

  private customFilter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.items?.filter((option) => option[this.filterBy]?.toLowerCase().includes(filterValue));
  }

  addSelectedProduct(option) {
    if ( option == null
      || option === ''
      || this.addedItems.includes(option)
      || this.addedItems.find(item => item.id === this.optionSelected.id)
      || !this.optionSelected?.id
    ) {
      this.inputRef.nativeElement.value = '';
      // throw Error('value same or empty');
    } else {
      this.inputRef.nativeElement.value = '';
      if(!this.multiple && this.addedItems?.length) {
        return;
      }
      const item = this.items.find((product) => product.id === this.optionSelected.id);
      this.addedItems.push(item);
      this.optionSelected = null;
      this.filteredOptions = this.customFilter('');
      this.inputRef.nativeElement.blur();
      this.emitChanges();
    }
  }
}
