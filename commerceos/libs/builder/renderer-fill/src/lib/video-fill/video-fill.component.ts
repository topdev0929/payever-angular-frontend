import { isPlatformServer } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject, fromEvent, merge } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import {
  PebContainerType,
  PebFillMode,
  PebRenderContainer,
  PebRenderElementModel,
  PebVideoFill,
  PebVideoPlayStatus,
  PebRenderUpdateModel,
} from '@pe/builder/core';
import { getFillModeStyle } from '@pe/builder/render-utils';
import { PebRenderUpdateAction } from '@pe/builder/view-actions';

@Component({
  selector: 'peb-video-fill',
  templateUrl: './video-fill.component.html',
  styleUrls: ['./video-fill.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebVideoFillComponent implements OnChanges, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  isPlaying = false;
  isLazy = false;

  @Input() element!: PebRenderElementModel;
  @Input() video!: PebVideoFill;
  @Input() container!: PebRenderContainer;

  @ViewChild('player') private player!: ElementRef<HTMLVideoElement>;

  fillModeToObjectFit = {
    [PebFillMode.Original]: 'none',
    [PebFillMode.Stretch]: 'fill',
    [PebFillMode.Fit]: 'contain',
    [PebFillMode.Fill]: 'cover',
    [PebFillMode.Tile]: '',
  };

  pebFillMode = PebFillMode;

  get videoPreviewStyles() {
    const video = this.video;

    return video
      ? {
        backgroundImage: `url(${video.preview})`,
        ...getFillModeStyle(video.fillMode),
      }
      : undefined;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private readonly store: Store
  ) {
  }

  ngAfterViewInit(): void {
    if (
      isPlatformServer(this.platformId)
      || !this.player?.nativeElement
      || this.container.key === PebContainerType.Editor
    ) {
      return;
    }

    merge(
      fromEvent(this.player.nativeElement, 'play').pipe(map(() => true)),
      fromEvent(this.player.nativeElement, 'pause').pipe(map(() => false)),
    ).pipe(
      filter(isPlaying => this.isPlaying !== isPlaying),
      tap((isPlaying) => {
        this.isPlaying = isPlaying;
        this.store.dispatch(new PebRenderUpdateAction([{
          id: this.element.id,
          state: {
            video: {
              playStatus: this.isPlaying
                ? PebVideoPlayStatus.Playing
                : PebVideoPlayStatus.Paused,
            },
          },
        }]));
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const curr: PebRenderUpdateModel = changes.element.currentValue;
    const isPlaying = curr.state?.video?.playStatus === PebVideoPlayStatus.Playing;
    this.isLazy = curr.fill?.lazy?.enabled === true;

    if (this.isPlaying === isPlaying) {
      return;
    }

    this.isPlaying = isPlaying;
    const video = this.player?.nativeElement;
    if (video?.src) {
      isPlaying ? video.play() : video.pause();
    }

    const setTime = curr.state?.video?.setTime;
    setTime !== undefined && (video.currentTime = 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
