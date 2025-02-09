import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PebBlogEditorModule } from '@pe/builder-blog-editor';

import { PebBlogEditorComponent } from './blog-editor.component';
import { BlogThemeGuard } from '../../guards/theme.guard';

export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebBlogEditorComponent,
    canActivate:[BlogThemeGuard]

  },
]);

@NgModule({
  imports: [
    CommonModule,
    PebBlogEditorModule,
    routerModule,
  ],
  declarations: [
    PebBlogEditorComponent,
  ],
})
export class PebBlogEditorRouteModule {}
