import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  Component, ComponentFactoryResolver,
  HostBinding,
  Inject,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { from, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { MediaType, StudioApiService, MediaViewEnum, PeStudioMedia } from '../../core';

import { PePreviewComponent } from './preview/pe-preview.component';

@Component({
  selector: 'lib-my-media',
  templateUrl: './pe-my-media.component.html',
  styleUrls: ['./pe-my-media.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PeMyMediaComponent implements OnInit {
  @HostBinding('class') previewModal = 'pe-studio-my-media';
  @ViewChild('rendererContainer', { read: ViewContainerRef }) private containerViewRef!: ViewContainerRef;


  image$: Observable<PeStudioMedia>;
  theme: string;
  mediaType = MediaType;

  model = {
    url: this.mediaData.data.url,
  }

  constructor(
    private mediaService: StudioApiService,
    public dialog: MatDialog,
    private overlay: Overlay,
    private injector: Injector,
    private readonly componentFactory: ComponentFactoryResolver,
    @Inject(MAT_DIALOG_DATA) public mediaData,
  ) {
  }

  ngOnInit(): void {
    this.theme = this.mediaData.theme;
    if (this.mediaData.mediaView === MediaViewEnum.allMedia) {
      this.image$ = this.mediaService.getSubscriptionMediaById(this.mediaData.id);
    } else {
      this.image$ = this.mediaService.getUserSubscriptionMediaById(this.mediaData.id);
    }

    if (this.mediaData.mediaType === MediaType.Model) {
      this.loadRenderer();
    }
  }


  openPreviewDialog() {
    this.image$.pipe(
      switchMap((image) => {
        const overlayRef = this.overlay.create({
          disposeOnNavigation: true,
          hasBackdrop: true,
          positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
          backdropClass: 'cdk-dark-backdrop',
          panelClass: 'preview-modal',
        });
        const confirmScreenPortal = new ComponentPortal(PePreviewComponent, null, this.createInjector(image));
        const confirmScreenRef = overlayRef.attach(confirmScreenPortal);

        return confirmScreenRef.instance.detachOverlay
          .pipe(
            tap(() => {
              overlayRef.detach();
              overlayRef.dispose();
            })
          );
      }),
      take(1),
    ).subscribe();
  }

  private createInjector(headings = {}): Injector {
    return Injector.create({
      parent: this.injector,
      providers: [{
        provide: MAT_DIALOG_DATA,
        useValue: { ...this.mediaData, ...headings },
      }],
    });
  }

  downloadImage() {
    this.image$.pipe(
      tap((image) => {
        this.mediaService.downloadMedia(image.url);
      }),
      take(1),
    ).subscribe();
  }

  private loadRenderer(): void {
    from(import(`@pe/threejs`)).pipe(
      tap(({ ThreejsRendererComponent }) => {
        const componentFactory = this.componentFactory.resolveComponentFactory(ThreejsRendererComponent);
        const componentRef = this.containerViewRef.createComponent(componentFactory);
        componentRef.instance.model = { url: this.mediaData.data.url };
        componentRef.changeDetectorRef.detectChanges();
      }),
      take(1),
    ).subscribe();
  }
}
