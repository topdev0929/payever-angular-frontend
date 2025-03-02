import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { delay, map, startWith, takeUntil, tap } from 'rxjs/operators';


@Component({
  selector: 'pe-chat-autocomplete',
  styleUrls: ['./chat-autocomplete.component.scss'],
  templateUrl: './chat-autocomplete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatAutocompleteComponent implements OnInit, OnDestroy {

  destroy$ = new Subject<void>();
  items$ = new BehaviorSubject<any>([]);

  @Input() label!: string;
  @Input() items: any[] = [];
  @Input() theme = 'dark';
  @Input() errorMessage : string | null;
  @Input() isFieldInvalid : boolean;

  @Output() selected = new EventEmitter<any>();

  @ViewChild('input', { read: MatAutocompleteTrigger }) elementRef: MatAutocompleteTrigger;

  formControl: FormControl = new FormControl('',[Validators.required]);
  filteredItems: Observable<any>;
  selectedItem: any;

  ngOnInit(): void {
    this.filteredItems = this.formControl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        this.items$.next(this.arraySearch(this.items, (value?.name ?? value).substring(1)));

        return this.filter(value);
      })
    );

    this.items$.pipe(
      delay(0),
      tap(() => {
        this.elementRef?.openPanel();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  optionSelected(event: any): void {
    const option = event.option.value;

    this.selectedItem = option;
    this.formControl.patchValue(`/${option.name}/`);

    if (option.children) {
      this.items$.next(option.children);
    }
  }

  arraySearch(array, value): any {
    for (const element of array) {
      if (this.normalizeValue(element.name).slice(0, value.length) === this.normalizeValue(value)) {
        return array;
      } else if (element.children?.length) {
        const result = this.arraySearch(element.children, value);
        if (result) {
          return result;
        }
      }
     }
  }

  onBlur(): void {
    const value = this.formControl.value.slice(-1) === '/'
      ? this.formControl.value.slice(1, -1)
      : this.formControl.value;

    this.selected.emit(this.selectedItem?.name === value ? this.selectedItem : value);
  }

  private filter(value: any): any[] {
    const filterValue: string = this.normalizeValue(value.name?.substring(1) ?? value?.substring(1));

    return value[0] === '/'
      ? this.items$.value?.filter(item => this.normalizeValue(item.name).includes(filterValue))
      : [];
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  trackOption(index: number, option: any): any {
    return option;
  }
}
