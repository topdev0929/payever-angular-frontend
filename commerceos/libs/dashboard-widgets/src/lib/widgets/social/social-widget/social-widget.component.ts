import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, Input, OnInit } from '@angular/core';
import { EMPTY, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EditWidgetsService, MessageNameEnum } from '@pe/shared/widget';
import { WallpaperService } from '@pe/wallpaper';
import { Widget } from '@pe/widgets';

import { SocialInterface } from '../../../interfaces';
import { AbstractWidgetComponent } from '../../abstract-widget.component';

@Component({
  selector: 'social-widget',
  templateUrl: './social-widget.component.html',
  styleUrls: ['./social-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialWidgetComponent extends AbstractWidgetComponent implements OnInit {
  readonly appName: string = 'social';
  @Input() widget: Widget;

  constructor(
    injector: Injector,
    private cdr: ChangeDetectorRef,
    private editWidgetsService: EditWidgetsService,
    protected wallpaperService: WallpaperService,
  ) {
    super(injector);

    this.editWidgetsService.emitEventWithInterceptor(MessageNameEnum.BUSINESS_DEFAULT_SOCIAL_DATA);
  }

  ngOnInit(): void {
    this.editWidgetsService.defaultSocialSubject$.pipe(
      takeUntil(this.destroy$),
      tap((data: { posts: SocialInterface[] }) => {
        if (!data?.posts) {
          return;
        }

        const socialData = this.getLastSocialPosts(12, data.posts).map((social: SocialInterface) => ({
          title: social?.content?.length > 6 ? social?.content?.slice(0, 5) : social?.content,
          imgSrc: social?.media?.length > 0 ? social?.media[0] : null,
          onSelect: (post: any) => {
            return of(this.onOpenPost(post));
          },
          onSelectData: social,
        }));

        this.widget = {
          ...this.widget,
          data: socialData,
          openButtonFn: () => {
            this.onOpenButtonClick();

            return EMPTY;
          },
        };
        this.cdr.detectChanges();
      }),

    ).subscribe();
  }

  onOpenPost(post: SocialInterface): Promise<boolean | void> {
    return this.router.navigate(['business', post.businessId, this.appName, 'posts', post.id, 'details']);
  }

  private getLastSocialPosts(count: number, posts: SocialInterface[]): SocialInterface[] {
    return posts.slice().sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);

      return dateB.getTime() - dateA.getTime();
    }).slice(0, count);
  }
}


