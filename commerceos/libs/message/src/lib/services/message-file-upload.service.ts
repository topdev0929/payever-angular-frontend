import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as uuid from 'uuid';

import { PE_ENV } from '@pe/common';
import {
  PeMessageAppService,
  PeMessageApiService,
} from '@pe/message/shared';
import { PeChatAttachFileUpload, PeChatMessageType, PeChatThumbs } from '@pe/shared/chat';



@Injectable({
  providedIn: 'root',
})
export class PeMessageFileUploadService {

  constructor(
    private peMessageApiService: PeMessageApiService,
    @Inject(PE_ENV) public environmentConfigInterface: any,
    private peMessageAppService: PeMessageAppService,
  ) { }

  public attachFileUpload(data: PeChatAttachFileUpload, sender?: string) {
    const filesUploadArr$: Observable<any>[] = data.files.map(file =>
      data.url && data.files[0].size === 0
        ? this.postFileViaURL(data, file)
        : this.postFile(file)
    );

    forkJoin(filesUploadArr$).pipe(tap(files => this.sendMessageAfterUpload(files, data, sender))).subscribe();
  }

  private postFileViaURL(data, file): Observable<any> {
    return this.peMessageApiService.postFileViaURL(data.url).pipe(
      map((res: any) => {
        let blob = new Blob(Array(parseInt(res.fileSize)).fill(0), { type: file.type });
        blob = blob.slice(0, parseInt(res.fileSize));
        const fileWithSize = new File([blob], 'FileWithUrl', { type: file.type });

        return { res: { ...res }, file: fileWithSize };
      }));
  }

  private postFile(file): Observable<any> {
    return this.peMessageApiService.postFile(file).pipe(
      map(res => ({ res, file })));
  }

  private sendMessageAfterUpload(files, data, sender: string) {
    const url = PeChatThumbs.Files as string;
    const event = {
      contentPayload: uuid.v4(),
      type: PeChatMessageType.Text,
      sender,
      sentAt: new Date(),
      content: data.text || '{#empty#}',
      chat: this.peMessageAppService.selectedChannel._id,
      attachments: files.map((response) => {
        const fileUrl = (!data.url || response.file.name !=='FileWithUrl')
          ? response.res.body.blobName
          : response.res.blobName;

        return {
          mimeType: response.file.type,
          size: response.file.size,
          title: data.text,
          url,
          data: {
            url: `${this.environmentConfigInterface.custom.storage}/message/${fileUrl}`,
          },
        };


      }),
    };
    this.peMessageAppService.sendMessage(event);
  }
}
