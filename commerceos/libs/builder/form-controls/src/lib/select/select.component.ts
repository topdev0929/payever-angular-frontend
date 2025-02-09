import { ChangeDetectionStrategy, Component, forwardRef, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';

import { PebSidebarHeader, PebSidebarListOptionsConfig, SelectOption } from '@pe/builder/core';
import { PebSideBarService } from '@pe/builder/services';

import { PebSelectOptionListComponent } from './option-list.component';

@Component({
  selector: 'peb-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useValue: forwardRef(() => PebSelectComponent),
      multi: true,
    },
  ],
})
export class PebSelectComponent implements ControlValueAccessor {

  @Input() disabled: boolean;
  @Input() label: string;
  @Input() options: SelectOption[] | SelectOption[][];
  @Input() placeholder?: string;

  readonly value$ = new BehaviorSubject<string>('');

  onChange: (value: string) => void;
  onTouched: () => void;

  constructor(
    private sidebarService: PebSideBarService,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(value: string): void {
    const options: SelectOption[] = [];

    this.options?.forEach((opt) => {
      if (Array.isArray(opt)) {
        options.push(...opt);
      } else {
        options.push(opt);
      }
    });

    const option = options.find(o => o.value === value);

    this.value$.next(option ? option.name : '');
  }

  openListOptions(header: PebSidebarHeader, { active, options }: PebSidebarListOptionsConfig): Observable<string> {
    const componentRef = this.sidebarService.openDetail(PebSelectOptionListComponent, header);

    componentRef.instance.active = active;
    componentRef.instance.options = options;

    return componentRef.instance.selected.pipe(takeUntil(componentRef.instance.destroy$));
  }

  openOptionList() {
    const selected = this.openListOptions(
      { backTitle: 'Back', title: this.label },
      { active: this.ngControl?.value, options: this.options },
    );

    selected.pipe(
      take(1),
      tap((value: any) => {
        this.onTouched();
        this.onChange(value);
        this.writeValue(value);
        this.sidebarService.back();
      }),
    ).subscribe();
  }
}
