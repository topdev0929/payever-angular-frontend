import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebBlogComponent } from './routes/_root/blog-root.component';
import { BlogThemeGuard } from './guards/theme.guard';
import { PebBlogDashboardComponent } from './routes/dashboard/blog-dashboard.component';
import { PebBlogSettingsComponent } from './routes/settings/blog-settings.component';
import { PebBlogThemesComponent } from './routes/themes/blog-themes.component';
import { PebBlogGuard } from './guards/blog.guard';
import { PebBlogEditorRouteModule } from './routes/editor/blog-editor.module';

export function shopEditorRoute() {
  return PebBlogEditorRouteModule;
}

const routes: Routes = [
  {
    path: '',
    component: PebBlogComponent,
    canActivate: [PebBlogGuard],
    children: [
      {
        path: ':blogId',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebBlogDashboardComponent,
            canActivate:[BlogThemeGuard],
          },
          {
            path: 'edit',
            loadChildren: shopEditorRoute,
          },
          {
            path: 'settings',
            component: PebBlogSettingsComponent,

          },
          {
            path: 'themes',
            component: PebBlogThemesComponent,
          },
          {
            path: 'builder/:themeId/edit',
            loadChildren: shopEditorRoute,
          },
        ],
      },
    ],
  },
];

// // HACK: fix --prod build
// // https://github.com/angular/angular/issues/23609
export const routerModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [routerModuleForChild],
  exports: [RouterModule],
  providers: [
    BlogThemeGuard,
  ],
})
export class PebBlogRouteModule { }
