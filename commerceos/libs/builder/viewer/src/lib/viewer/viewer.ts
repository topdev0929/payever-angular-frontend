import { HashLocationStrategy, Location, LocationStrategy } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Injectable,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { animationFrameScheduler, BehaviorSubject, EMPTY, ReplaySubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  switchMap,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { PebInteractionType, PebLanguageEnum, PebScreen, PebShop } from '@pe/builder/core';
import { fromResizeObserver } from '@pe/builder/editor-utils';


@Injectable()
export class ViewerLocationStrategy extends HashLocationStrategy {
  prepareExternalUrl(internal: string): string {
    return `${(this as any)._platformLocation.location.pathname}#${internal}`;
  }
}


@Component({
  selector: 'peb-viewer',
  templateUrl: './viewer.html',
  styleUrls: ['./viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    Location,
    {
      provide: LocationStrategy,
      useClass: ViewerLocationStrategy,
    },
  ],
})
export class PebViewer implements OnChanges, AfterViewInit {
  hostWidth: number;
  scale = 1;

  @Input() themeSnapshot: any;

  @Input() themeCompiled: PebShop;

  @Input() set locale(locale: PebLanguageEnum) {
    this.locale$.next(locale);
  }

  @Input() screen: PebScreen;

  @Output() interacted = new EventEmitter();

  readonly viewInit$ = new Subject<void>();

  readonly theme$ = new Subject<PebShop>();

  readonly locale$ = new BehaviorSubject<PebLanguageEnum>(PebLanguageEnum.English);

  readonly defaultLocale$ = new BehaviorSubject<PebLanguageEnum>(PebLanguageEnum.English);

  readonly screen$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.elementRef.nativeElement)),
    map((hostDss: Partial<DOMRectReadOnly>) => {
      this.hostWidth = hostDss.width;

      const screen = undefined;
      const result = this.screen || screen;
      this.scale = this.hostWidth > result.width
        ? 1
        : this.hostWidth / result.width;

      return result;
    }),
    throttleTime(100, animationFrameScheduler, { trailing: true }),
    tap(() => this.cdr.detectChanges()),
    distinctUntilChanged(),
    shareReplay(1),
  );

  readonly elements$ = new ReplaySubject<any>(1);

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.themeSnapshot && this.themeCompiled) {
      throw new Error('Viewer accepts either snapshot or compiled theme. You should not provide both');
    }

    if (changes.themeSnapshot || changes.themeCompiled || changes.screen) {
      this.theme$.next(this.themeCompiled);
    }
  }

  ngAfterViewInit() {
    this.screen$.pipe(
      withLatestFrom(this.locale$),
      switchMap(() => {
        return EMPTY;
      }),
    ).subscribe();


    this.viewInit$.next();

    this.cdr.markForCheck();
  }

  onRendererInteraction(evt) {
    if (evt.type === PebInteractionType.ChangeLanguage) {
      this.locale$.next(evt.payload);
    }

    this.interacted.emit(evt);
  }
}
