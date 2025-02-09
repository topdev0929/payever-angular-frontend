import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pe-products-autocomplete',
  templateUrl: './products-autocomplete.component.html',
  styleUrls: ['./products-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeProductsAutocompleteComponent implements OnInit {

  @Input() label = '';
  @Input() values: string[];
  @Input() placeholder = 'Search';

  @Output() onSelected = new EventEmitter<string>();

  @ViewChild('input', { static: true }) elementRef: ElementRef;

  formControl: FormControl = new FormControl('');
  filteredValues: Observable<string[]>;

  constructor() {}

  ngOnInit(): void {
    this.filteredValues = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value)),
    );
  }

  valueSelected(value: string): void {
    this.elementRef.nativeElement.blur();
    this.formControl.patchValue(value);

    this.onSelected.emit(value);
  }

  private filter(value: string | any): string[] {
    const filterValue: string = this.normalizeValue(value);

    return this.values.filter(v => this.normalizeValue(v).includes(filterValue));
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  trackValue(index: number, value: string) {
    return value;
  }

  clear() {
    this.formControl.patchValue('');
  }
}
