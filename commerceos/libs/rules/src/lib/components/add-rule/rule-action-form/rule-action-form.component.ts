import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { FormArray } from '@angular/forms';

import { Action, ActionDataType, RuleAction } from '../../../models/rules.model';

@Component({
  selector: 'pe-rule-action-form',
  templateUrl: './rule-action-form.component.html',
  styleUrls: ['./rule-action-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class RuleActionFormComponent {
  @Input()
  action: Action;

  @Input()
  defaultData: ActionDataType;

  @Input()
  hideRemoveButton = false;

  @Input()
  showErrors = false;

  @Input()
  ruleForm: FormArray;

  @Output()
  remove = new EventEmitter<number>();

  ruleActionEnum = RuleAction;

  removeAction() {
    this.remove.emit();
  }
}
