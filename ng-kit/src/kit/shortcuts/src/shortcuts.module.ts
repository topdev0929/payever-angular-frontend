import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShortcutsComponent } from './shortcuts.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ShortcutsComponent],
  entryComponents: [ ShortcutsComponent ],
  exports: [ ShortcutsComponent ]
})
export class ShortcutsModule {}
