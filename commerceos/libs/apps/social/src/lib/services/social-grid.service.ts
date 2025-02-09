import { TitleCasePipe } from '@angular/common';
import { ElementRef, Injectable } from '@angular/core';
import moment from 'moment';

import { PeGridContextMenuActionsEnum, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { LocaleService, TranslateService } from '@pe/i18n-core';
import { PeOverlayRef } from '@pe/overlay-widget';
import { FolderItem } from '@pe/shared/folders';

import { PeSocialPostInterface } from '../interfaces';

@Injectable()
export class PeSocialGridService {
  public lastGridView: PeGridView;
  public postOverlayRef: PeOverlayRef;
  public selectedFolder: FolderItem;

  constructor(
    private localeService: LocaleService,
    private titleCasePipe: TitleCasePipe,
    private translateService: TranslateService,
  ) {
    this.setLocale();
  }

  public postsToGridItemMapper(posts: PeSocialPostInterface[], canvas: ElementRef): PeGridItem[] {
    return posts.map((post: PeSocialPostInterface): PeGridItem => {

      const day = this.transformMoment(post, 'dddd');
      const date = this.transformMoment(post, 'DD MMMM YYYY');
      const dayClass = day ? 'social-day-item' : '';
      const postInfo = `<div class="${dayClass}">${day}</div><div>${date}</div>`;
      const postStatus = `social-app.badges.${post.status}`;

      return {
        action: {
          label: 'grid.actions.edit',
          more: true,
        },
        badge: {
          backgroundColor: null,
          color: null,
          label: postStatus,
        },
        columns: [
          {
            name: 'name',
            value: post.content,
          },
          {
            name: 'type',
            value: this.translateService.translate(`social-app.post_editor.post_type.${post.type}`),
          },
          {
            name: 'condition',
            value: this.translateService.translate(postStatus),
          },
          {
            name: 'action',
            value: 'action',
          },
        ],
        hideMenuItems: [
          {
            hide: true,
            value: PeGridContextMenuActionsEnum.Edit,
          },
        ],
        id: post?.applicationScopeElasticId ?? post._id,
        image: null,
        data: {
          ...post,
          text: postInfo,
        },
        isDraggable: true,
        serviceEntityId: post?.serviceEntityId ?? post._id,
        title: post.content,
        type: PeGridItemType.Item,
      };
    });
  }

  public backdropClick = () => { };

  private setLocale = () => { moment.locale(this.localeService.currentLocale$.value.code); }

  private transformMoment = (post: PeSocialPostInterface, format: string) => {
    return this.titleCasePipe.transform(
      moment(post.toBePostedAt || post.updatedAt || post.createdAt).format(format.replace('MMMM', 'MMM')));
  };

}
