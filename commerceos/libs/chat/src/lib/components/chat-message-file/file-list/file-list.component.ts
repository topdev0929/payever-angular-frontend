import { HttpClient, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { PeChatMessageFileInterface } from '@pe/shared/chat';
import { fileSize } from '@pe/shared/utils/file-size';

@Component({
  selector: 'pe-chat-message-file-list',
  templateUrl: 'file-list.component.html',
  styleUrls: ['file-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageFileListComponent {
  @Input() files: PeChatMessageFileInterface[] = [];

  public fileSize = fileSize;
  private readonly httpClient = this.injector.get(HttpClient);

  constructor(
    private injector: Injector,
    private readonly destroy$: PeDestroyService,
  ) { }


  public trackBy(file: PeChatMessageFileInterface, index: number) {
    return file._id;
  }

  private createRequest(file: Partial<PeChatMessageFileInterface>): Observable<any> {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      file.loaded$.next(fileReader.result as string);
    };

    return this.httpClient
      .get(file.url, { observe: 'events', reportProgress: true, responseType: 'blob' })
      .pipe(
        tap((event) => {
          switch (event.type) {
            case HttpEventType.Response: {
              fileReader.readAsDataURL(event.body);
              break;
            }
            case HttpEventType.DownloadProgress: {
              const progress = Math.ceil(event.loaded / event.total * 100);
              file.loadProgress$.next(progress);
              break;
            }
          }
        }
        ));
  }

  public readonly download = (file): void => {
    this.createRequest(file).pipe(takeUntil(this.destroy$)).subscribe();
  }
}
