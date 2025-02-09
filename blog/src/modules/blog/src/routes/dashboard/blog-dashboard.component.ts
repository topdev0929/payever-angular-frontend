import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { MessageBus, PebEnvService } from '@pe/builder-core';
import { BlogPreviewDTO, PebBlogsApi } from '@pe/builder-api';
import { AppThemeEnum } from '@pe/common';
import { FontLoaderService } from '@pe/builder-font-loader';
import { PEB_BLOG_HOST } from '../../constants';

@Component({
  selector: 'peb-blog-dashboard',
  templateUrl: './blog-dashboard.component.html',
  styleUrls: ['./blog-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBlogDashboardComponent implements OnInit {

  preview$: Observable<BlogPreviewDTO> = this.apiService.getBlogPreview(this.route.snapshot.params.blogId).pipe(
    shareReplay(1),
  );

  theme =this.envService?.businessData?.themeSettings?.theme? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  :AppThemeEnum.default;
  blog: any;

  constructor(
    private messageBus: MessageBus,
    private apiService: PebBlogsApi,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private envService: PebEnvService,
    private fontLoaderService: FontLoaderService,
    @Inject(PEB_BLOG_HOST) public blogHost: string,

  ) {
    this.fontLoaderService.renderFontLoader();
  }

  onEditClick(): void {
    this.messageBus.emit('blog.navigate.edit', this.route.snapshot.params.blogId);
  }

  ngOnInit() {
    this.apiService.getSingleBlog(this.route.snapshot.params.blogId).subscribe((blog) => {
      this.blog = blog;
      this.cdr.markForCheck();
    });
  }

  onOpenClick(): void {
    this.messageBus.emit('blog.open', this.blog);
  }
}
