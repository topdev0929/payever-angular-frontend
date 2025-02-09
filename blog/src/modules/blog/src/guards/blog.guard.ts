import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { PebBlogsApi } from '@pe/builder-api';

@Injectable()
export class PebBlogGuard implements CanActivate {

  constructor(
    private api: PebBlogsApi,
    private envService: PebEnvService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (route?.firstChild?.firstChild?.params.blogId) {
      this.envService.blogId = route?.firstChild?.firstChild?.params?.blogId;
      return this.api.getSingleBlog(route?.firstChild?.firstChild?.params?.blogId).pipe(
        map(data => {
          route.data = { ...route.data, blog: data };
          return true;
        })
      )
    }
    return this.api.getBlogsList().pipe(
      switchMap(blogs => {
        return blogs.length ?
          of(blogs) :
          this.api.createBlog({ author: 'test', title: 'test', content: 'test' }).pipe(
            map(blog => [blog]),
          );
      }),
      map((blogs) => {
       /*  const defaultBlog = blogs.find(blog => blog.isDefault === true);
        if (!defaultBlog) { */
          this.envService.blogId = blogs[0]._id;
          route.data = { ...route.data, blog: blogs[0] };
          return true;
        /*}
         this.envService.blogId = defaultBlog._id;
        route.data = { ...route.data, blog: defaultBlog };
        return true; */
      }),
      catchError((err) => {
        console.error(err);
        return of(false);
      }),
    )
  }
}
