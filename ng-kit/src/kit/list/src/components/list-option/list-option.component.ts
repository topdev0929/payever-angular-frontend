import { Component, Input, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { MatListOption } from '@angular/material/list';

@Component({
  selector: 'pe-list-option',
  templateUrl: 'list-option.component.html',
  encapsulation: ViewEncapsulation.None
})
export class ListOptionComponent implements OnInit {

  @Input() checkboxPosition: 'before' | 'after' = 'after';
  @Input() disableRipple: boolean;
  @Input() disabled: boolean;
  @Input() selected: boolean;
  @Input() value: any;

  @ViewChild('listOption', { static: true }) listOption: MatListOption;

  ngOnInit(): void {
    this.checkboxPosition = this.checkboxPosition || 'after';
  }

  focus(): void {
    this.listOption.focus();
  }

  toggle(): void {
    this.listOption.toggle();
  }
}
