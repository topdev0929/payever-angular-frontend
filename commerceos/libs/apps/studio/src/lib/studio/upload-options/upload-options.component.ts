import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { switchMap, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

import { UploadTextService, MediaType } from '../../core';
import { getAcceptType } from '../../utils/utils';

@Component({
  selector: 'pe-studio-upload-options',
  templateUrl: './upload-options.component.html',
  styleUrls: ['./upload-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeStudioUploadOptionsComponent {
  @ViewChild('fileSelector') fileSelectorRef: ElementRef<HTMLElement>;

  options: { title: string, mediaType: MediaType, action: () => void }[] = [
    {
      title: 'Text',
      mediaType: MediaType.Text,
      action: () => this.openText(),
    },
    {
      title: 'Photo',
      mediaType: MediaType.Image,
      action: () => this.openFileSelector(MediaType.Image),
    },
    {
      title: 'Video',
      mediaType: MediaType.Video,
      action: () => this.openFileSelector(MediaType.Video),
    },
    {
      title: 'Js',
      mediaType: MediaType.Script,
      action: () => this.openFileSelector(MediaType.Script),
    },
    {
      title: '3D Model',
      mediaType: MediaType.Model,
      action: () => this.openFileSelector(MediaType.Model),
    },
  ];

  constructor(
    private matDialogRef: MatDialogRef<PeStudioUploadOptionsComponent>,
    private uploadTextService: UploadTextService,
    private renderer: Renderer2,
  ) {}

  public uploadMedia(event: Event): void {
    this.matDialogRef.close({
      files: (event.target as HTMLInputElement).files,
    });
  }

  public cancel(): void {
    this.matDialogRef.close();
  }

  private openFileSelector(type: MediaType): void {
    const acceptType = getAcceptType(type);
    this.renderer.setAttribute(this.fileSelectorRef.nativeElement, 'accept', acceptType);
    this.fileSelectorRef.nativeElement.click();
  }

  private openText(): void {
    this.uploadTextService.openTextEditor().pipe(
      tap(({ payload }) => {
        this.matDialogRef.close(payload);
      }),
      switchMap(({ overlayRef }) =>
        this.matDialogRef.afterClosed().pipe(
          tap(() => overlayRef.close()),
        ),
      ),
    ).subscribe();
  }

}
