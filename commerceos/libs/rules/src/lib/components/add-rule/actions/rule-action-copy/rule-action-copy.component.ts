import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { CopyActionDataType, RuleFolder } from '../../../../models/rules.model';
import { AbstractActionForm } from '../abstract-action-form.component';

@Component({
  selector: 'pe-rule-action-copy',
  templateUrl: './rule-action-copy.component.html',
  styleUrls: ['./rule-action-copy.component.scss'],
})
export class RuleActionCopyComponent extends AbstractActionForm implements OnInit {
  @Input() defaultData: CopyActionDataType;

  folderList: RuleFolder[] = [];

  ngOnInit(): void {
    this.folderList = this.overlayData.folders;
    this.formGroup.addControl('folderId', new FormControl(this.defaultData?.folderId, [Validators.required]));
  }
}
