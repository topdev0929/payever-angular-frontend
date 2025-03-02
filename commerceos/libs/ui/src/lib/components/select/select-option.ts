import { Component, EventEmitter, HostBinding, HostListener, Input, OnInit, Output } from '@angular/core';

import { EnvService } from '@pe/common';

import { ActionField } from './interfaces';
import { PebSelectComponent } from './select';
import { SelectService } from './select.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'peb-select-option',
  template: `
    <span>
      {{ label }}
    </span>
    <ng-container *ngIf="icon">
      <svg [style.color]="icon.color" height="14" width="14">
        <use [attr.xlink:href]="icon.id"></use>
      </svg>
    </ng-container>
    <ng-container *ngIf="action">
      <div (click)="onSelectAction($event)" class="action-text">
        {{ action.name }}
      </div>
    </ng-container>
    <div class="check-container" *ngIf="isMultiple">
      <svg class="check-background" *ngIf="!isSelected">
        <use xlink:href="#icon-ui-grid-dark-deselected"></use>
      </svg>
      <div class="checkbox" *ngIf="isSelected">
        <svg class="check">
          <use xlink:href="#icon-ui-check"></use>
        </svg>
      </div>
    </div>
  `,
  styleUrls: ['./option.scss'],
})
export class SelectOptionComponent implements OnInit {
  isSelected = false;
  isMultiple = false;
  @Input()
  public value: string;

  @Input()
  public label: string;

  @Input()
  public icon: { id: string, color: string };

  @Input()
  public action: { id: string, name: string, value: string };

  @Output()
  public callAction: EventEmitter<ActionField> = new EventEmitter<ActionField>();

  @HostBinding('class.selected')
  public get selected(): boolean {
    if (this.select?.multiple) {
      this.isSelected = this.select.selectedOptions.indexOf(this) !== -1

      return this.isSelected;
    }

    return this.select.selectedOption === this;
  }

  @HostBinding('class.border') border = true;

  private select: PebSelectComponent;


  @HostBinding('class') classes = `peb-select-option`;

  constructor(
    private envService: EnvService,
    private selectService: SelectService
  ) {
    this.select = this.selectService.getSelect();
  }

  ngOnInit() {
    this.isMultiple = this.select.multiple;
  }

  public onSelectAction($event) {
    $event.stopPropagation();
    this.callAction.emit({ id: this.action.id, name: this.action.name, value: this.value });
  }

  @HostListener('click', ['$event'])
  public onClick(event: UIEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.select.selectOption(this);
  }
}
