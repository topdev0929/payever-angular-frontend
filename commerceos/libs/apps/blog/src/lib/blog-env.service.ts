import { Inject, Injectable } from '@angular/core';

import { PeAppEnv } from '@pe/app-env';
import { AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class PeBlogEnv implements PeAppEnv {
  id: string;
  business: string;
  type = AppType.Blog;
  host: string;
  api: string;
  ws: string;
  builder: string;
  mediaContainer = 'blog';

  constructor(
    @Inject(PE_ENV) env: EnvironmentConfigInterface,
  ) {
    this.host = env.primary.blogHost;
    this.api = env.backend.blog;
    this.ws = env.backend.builderBlogWs;
    this.builder = env.backend.builderBlog;
  }
}
