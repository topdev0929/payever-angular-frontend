import { ChangeDetectionStrategy, Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { SizeUnitEnum } from '../../../enums';
import { BaseStyleItemComponent } from '../base-item.component';

@Component({
  selector: 'pe-style-input-size',
  templateUrl: './input-size.component.html',
  styleUrls: ['./input-size.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class StyleInputSizeComponent extends BaseStyleItemComponent implements OnInit {
  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  private destroyed$ = this.injector.get(PeDestroyService);

  public sizeUnit = new FormControl(SizeUnitEnum.Px);

  @Input() excludeUnits: SizeUnitEnum[] = [];
  @Input() min = 0;
  @Input() max = Number.MAX_SAFE_INTEGER;
  @ViewChild('input') input: ElementRef;

  ngOnInit(): void {
    const unit = this.control.value.replace(/\d/g, '');
    this.sizeUnit.setValue(unit);

    this.sizeUnit.valueChanges.pipe(
      tap(() => {
        // to trigger unmaskFn
        this.input.nativeElement.dispatchEvent(new Event('input'));
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  public getUnitOptions(){
    return Object.values(SizeUnitEnum)
      .filter(unit=> !this.excludeUnits?.includes(unit));
  }

  public readonly unmaskFn = (value: string) => {
    return `${value}${this.sizeUnit.value}`;
  }

  public readonly maskFn = (input: string | number) => {
    if (!input) {
      return '0';
    }
    const value = input.toString().replace(/\D/g, '');
    const min = this.min || 0;
    const max = this.max || Number.MAX_SAFE_INTEGER;

    return Math.min(max, Math.max(parseInt(value, 10), min)).toString();
  }
}

