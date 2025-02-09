import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { TextMaskModule } from 'angular2-text-mask';

import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { I18nCoreModule } from '@pe/i18n-core';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PeAutocompleteModule,
  PebChipsModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebMessagesModule,
  PebSelectModule,
  PebDateTimePickerModule,
  PebButtonModule,
} from '@pe/ui';

import { RuleActionConditionComponent } from './components/add-rule/actions/rule-action-condition/rule-action-condition.component';
import { RuleActionCopyComponent } from './components/add-rule/actions/rule-action-copy/rule-action-copy.component';
import { RuleActionEmailComponent } from './components/add-rule/actions/rule-action-email/rule-action-email.component';
import { RuleActionMoveComponent } from './components/add-rule/actions/rule-action-move/rule-action-move.component';
import { AddRuleComponent } from './components/add-rule/add-rule.component';
import { RuleActionFormComponent } from './components/add-rule/rule-action-form/rule-action-form.component';
import { RuleActionListComponent } from './components/add-rule/rule-action-list/rule-action-list.component';
import { RuleActionsComponent } from './components/add-rule/rule-actions/rule-actions.component';
import { RuleCreateMessageComponent } from './components/create-message/create-message.component';
import { RuleDatePickerComponent } from './components/datepicker/rule-datepicker';
import { RuleListItemComponent } from './components/rule-list-item/rule-list-item.component';
import { RulesComponent } from './rules/rules.component';

(window as any).PayeverStatic?.IconLoader?.loadIcons([
  'rules',
  'edit-panel',
]);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatMomentDateModule,
    PebButtonModule,
    MatDialogModule,
    PebFormFieldInputModule,
    PebFormFieldInputModule,
    PebFormBackgroundModule,
    MatDatepickerModule,
    PebDateTimePickerModule,
    MatNativeDateModule,
    PebSelectModule,
    PebMessagesModule,
    PebChipsModule,
    I18nCoreModule,
    MatFormFieldModule,
    TextMaskModule,
    PeAutocompleteModule,
    ConfirmationScreenModule,
    MatIconModule,
    PETextEditorModule,
  ],
  declarations: [
    RulesComponent,
    RuleListItemComponent,
    AddRuleComponent,
    RuleDatePickerComponent,
    RuleCreateMessageComponent,
    RuleActionListComponent,
    RuleActionsComponent,
    RuleActionMoveComponent,
    RuleActionFormComponent,
    RuleActionConditionComponent,
    RuleActionCopyComponent,
    RuleActionEmailComponent,
  ],
  entryComponents: [
    RulesComponent,
    RuleListItemComponent,
    AddRuleComponent,
    RuleActionListComponent,
  ],
})
export class RulesModule {
  constructor(){
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'rules',
      'settings',
    ]);
  }
}
