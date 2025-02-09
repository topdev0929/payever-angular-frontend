import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { MoveActionDataType, RuleFolder } from '../../../../models/rules.model';
import { AbstractActionForm } from '../abstract-action-form.component';

@Component({
  selector: 'pe-rule-action-move',
  templateUrl: './rule-action-move.component.html',
  styleUrls: ['./rule-action-move.component.scss'],
})
export class RuleActionMoveComponent extends AbstractActionForm implements OnInit {
  @Input() defaultData: MoveActionDataType;

  folderList: RuleFolder[] = [];

  ngOnInit(): void {
    this.folderList = this.overlayData.folders;
    this.formGroup.addControl('folderId', new FormControl(this.defaultData?.folderId, [Validators.required]));
  }
}
