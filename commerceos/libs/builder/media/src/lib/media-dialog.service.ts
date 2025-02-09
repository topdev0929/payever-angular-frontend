import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import {
  PebFill,
  PebFillMode,
  PebFillOrigin,
  PebFillType,
  PebImageFill,
  PebJsFill,
  PebThreeJsFill,
  PebVideoFill,
} from '@pe/builder/core';
import { PeGridItem } from '@pe/common';

import { PebMediaComponent } from './media.component';

@Injectable()
export class PebMediaDialogService {
  mediaSelectionListener$ = new Subject<PebFill>();

  private fillResolver: { [key in StudioMediaType]: (item: any) => PebFill } = {
    [StudioMediaType.Script]: item => this.getJsFill(item),
    [StudioMediaType.Model]: item => this.getThreeJsFill(item),
    [StudioMediaType.Image]: item => this.getImageFill(item),
    [StudioMediaType.Video]: item => this.getVideoFill(item),
  };

  constructor(private readonly dialog: MatDialog, private readonly router: Router) {}

  openMediaDialog(data: any = {}): MatDialogRef<PebMediaComponent> {
    return this.dialog.open(PebMediaComponent, {
      data,
      height: '82.3vh',
      maxHeight: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: 'studio-dialog',
    });
  }

  openStudioDialog() {
    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children.primary.segments.map(segment => segment.path);

    segments.push('studio', 'list');

    this.router.navigate(segments, { queryParamsHandling: 'merge' }).then();
  }

  closeMediaDialog(mediaItem) {
    if (mediaItem) {
      const { mediaType } = mediaItem.data;
      const resolver = this.fillResolver[mediaType];

      if (resolver) {
        this.mediaSelectionListener$.next(resolver(mediaItem));
      }
    }

    const urlTree = this.router.parseUrl(this.router.url);
    const segments = urlTree.root.children.primary.segments;

    if (segments.length >= 2 && segments[segments.length - 2].path === 'studio') {
      segments.splice(-2, 2);
    }

    const newPath = segments.map(segment => segment.path);

    this.router.navigate(newPath, { queryParamsHandling: 'merge' }).then();
  }

  private getJsFill(item: PeGridItem): PebJsFill {
    return {
      origin: PebFillOrigin.Studio,
      type: PebFillType.Js,
      url: item.data.url,
      title: item.title,
    };
  }

  private getThreeJsFill(item: PeGridItem): PebThreeJsFill {
    return {
      origin: PebFillOrigin.Studio,
      type: PebFillType.ThreeJs,
      url: item.data.url,
      title: item.title,
    };
  }

  private getImageFill(item: PeGridItem): PebImageFill {
    return {
      origin: PebFillOrigin.Studio,
      type: PebFillType.Image,
      url: item.data.url,
      fillColor: null,
      fillMode: PebFillMode.Original,
      mimeType: item.data.mediaInfo?.type,
    };
  }

  private getVideoFill(item: PeGridItem): PebVideoFill {
    return {
      origin: PebFillOrigin.Studio,
      type: PebFillType.Video,
      url: item.data.url,
      fillMode: PebFillMode.Original,
      autoplay: false,
      controls: false,
      fillColor: null,
      loop: false,
      mimeType: item.data?.mediaInfo?.type,
      preview: item.image,
      sound: false,
    };
  }
}

enum StudioMediaType {
  Script = 'script',
  Model = 'model',
  Image = 'image',
  Video = 'video',
}
