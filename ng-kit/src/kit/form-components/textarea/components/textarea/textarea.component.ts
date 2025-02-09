import { Component, Input, Output, Injector, EventEmitter, OnInit } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { AbstractInputComponent } from '../../../input';
import { TextareaChangeEvent } from '../../interfaces';

@Component({
  selector: 'pe-textarea',
  templateUrl: './textarea.component.html',
})
export class TextareaComponent extends AbstractInputComponent implements OnInit {

  @Input() maxRows: number;
  @Input() minRows: number;

  @Output() valueChange: EventEmitter<TextareaChangeEvent> = new EventEmitter<TextareaChangeEvent>();

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.formControl) {
      this.formControl.valueChanges
        .pipe(takeUntil(this.destroyed$))
        .subscribe((data: string) => {
          this.valueChange.emit({value: data});
        });
    }
  }

}
