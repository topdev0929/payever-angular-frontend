import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { pebCreateEmptyBlog, PebEnvService } from '@pe/builder-core';
import { PebBlogsApi, PebThemesApi } from '@pe/builder-api';

@Injectable({ providedIn: 'any' })
export class BlogThemeGuard implements CanActivate {
  constructor(
    private apiService: PebBlogsApi,
    private themesApi:PebThemesApi,
    private envService: PebEnvService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot, state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const blogId = this.envService.blogId || route.parent.params.blogId;
    if (!blogId) {
      throw new Error('There is no BLOG ID in the url path');
    }

    return this.apiService.getBlogActiveTheme(blogId).pipe(

      switchMap((result: any) => {
        if(!result._id){
         return this.themesApi.createApplicationTheme('new theme', pebCreateEmptyBlog() as any)
        }
        return of(result)
      }),
      map((theme) => {
        console.log(theme);
       return true
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    );
  }
}
