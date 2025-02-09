import { Injector } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';

import { PeChatMessageFileInterface, PeChatMessageAttachment } from '@pe/shared/chat';
import { isValidImage } from '@pe/shared/utils/media-validators';

export class PeChatMessageFile implements PeChatMessageFileInterface {

  private readonly domSanitizer = this.injector.get(DomSanitizer);

  private readonly action$ = new Subject<void>();

  public readonly _id = this.file._id;
  public readonly isImage = isValidImage(this.file.mimeType);
  public readonly isMedia = false;
  public readonly loaded$ = new BehaviorSubject<string>(null);
  public readonly loadProgress$ = new BehaviorSubject<number>(0);
  public readonly mimeType = this.file.mimeType;
  public readonly safeUrl = this.domSanitizer.bypassSecurityTrustUrl(this.file.url);
  public readonly size = this.file.size;
  public readonly title = this.file.data.url.split('/').pop();
  public readonly type = this.file.mimeType.split('/')[0];
  public readonly url = this.file.data.url;
  public readonly urlStyle = isValidImage(this.file.mimeType)
    ? null
    : this.domSanitizer.bypassSecurityTrustStyle(`url("${this.file.url}")`);

  constructor(
    private file: PeChatMessageAttachment,
    private injector: Injector,
  ) { }

  public action(): void {
    const { action$, loaded$ } = this;

    if (loaded$.value) {
      fetch(loaded$.value)
        .then(res => res.blob())
        .then((blob) => {
          window.open(URL.createObjectURL(blob), '_blank');
        });
    } else {
      action$.next();
    }
  }
}
