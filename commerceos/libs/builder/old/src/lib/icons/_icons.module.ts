import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';


import { PebEditorLanguageChineseComponent } from './language-chinese.icon';
import { PebEditorLanguageEnglishComponent } from './language-english.icon';
import { PebEditorLanguageGermanComponent } from './language-german.icon';
import { PebEditorLanguageItalianComponent } from './language-italian.icon';
import { PebEditorLanguageSettingsComponent } from './language-settings.icon';
import { PebEditorLanguageSpanishComponent } from './language-spanish.icon';
import { PebEditorLanguageComponent } from './language.icon';
import { PebEditorMoveDownIconComponent } from './move-down.icon';
import { PebEditorMoveUpIconComponent } from './move-up.icon';


const icons = [
  PebEditorMoveUpIconComponent,
  PebEditorMoveDownIconComponent,
  PebEditorLanguageEnglishComponent,
  PebEditorLanguageGermanComponent,
  PebEditorLanguageItalianComponent,
  PebEditorLanguageSpanishComponent,
  PebEditorLanguageChineseComponent,
  PebEditorLanguageSettingsComponent,
  PebEditorLanguageComponent,
];

@NgModule({
  declarations: icons,
  exports: icons,
  imports: [
    CommonModule,
  ],
})
export class PebEditorIconsModule {
}
