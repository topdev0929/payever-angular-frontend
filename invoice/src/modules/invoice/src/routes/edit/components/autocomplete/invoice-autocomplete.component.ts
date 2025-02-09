import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  selector: 'pe-invoice-autocomplete',
  templateUrl: './invoice-autocomplete.component.html',
  styleUrls: ['./invoice-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeInvoiceAutocompleteComponent implements OnInit {

  @Input() items: any;
  @Input() placeholder?: string = 'Search';

  @Output() onSelected: EventEmitter<any> = new EventEmitter();

  @ViewChild('input', { static: true }) elementRef: ElementRef;

  formControl: FormControl = new FormControl('');
  filteredItems: Observable<string[]>;

  constructor() {}

  ngOnInit(): void {
    this.filteredItems = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value))
    );
  }

  optionSelected(value: string): void {
    this.elementRef.nativeElement.blur();
    this.formControl.patchValue('');

    this.onSelected.emit(value);
  }

  private filter(value: string): string[] {
    const filterValue: string = this.normalizeValue(value);

    return this.items.filter(item => this.normalizeValue(item.value).includes(filterValue));
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
}
