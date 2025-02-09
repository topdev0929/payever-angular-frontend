import { NewPlatformHeaderLoaderGuard } from '../core/guards/platform-header.guard';
import { AppLoadedResolver } from '../core/resolvers/app-loaded.resolver';
import { CategoriesResolver } from './resolvers/categories.resolver';
import { ThemesUserResolver } from './resolvers/themes-user.resolver';
import { ThemesResolver } from './resolvers/themes.resolver';
import { ClearActionsComponent } from './routes/clear-actions/clear-actions.component';
import { ListAllComponent } from './routes/list-all/list-all.component';
import { ListCategoryComponent } from './routes/list-category/list-category.component';
import { ListUsersComponent } from './routes/list-users/list-users.component';
import { ListComponent } from './routes/list/list.component';

export const themesRoutes = [
  {
    path: 'list',
    component: ListComponent,
    resolve: {
      AppLoadedResolver,
    },
    canActivate: [NewPlatformHeaderLoaderGuard],
    data: {
      activeHeaderView: 'themes', // need to activate "Themes" button in header
      loadHeaderAsync: true, // need for PlatformHeaderLoaderGuard
    },
    children: [
      {
        path: 'my',
        component: ListUsersComponent,
      },
      {
        path: 'clear-actions',
        component: ClearActionsComponent,
      },
      {
        path: 'all',
        component: ListAllComponent,
        resolve: {
          categories: CategoriesResolver,
        },
        children: [
          {
            path: '',
            component: ListCategoryComponent,
          },
          {
            path: ':industry',
            component: ListCategoryComponent,
          },
          {
            path: ':industry/:category',
            component: ListCategoryComponent,
          },
        ],
      },
      {
        path: '**',
        redirectTo: 'all',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'list',
  },
];
