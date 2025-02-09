import { Inject, Injectable } from '@angular/core';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

@Injectable()
export class BaseLinkFixerService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface
  ) {}

  // fixTextLinks(text: string): string {
  //   if (text && this.isIE() && this.isInIframe()) {
  //     const regex = /href\s*=\s*(['"])(https?:\/\/.+?)\1/ig;
  //     let link: string[] = null;
  //     while (true) {
  //       link = regex.exec(text);
  //       if (link === null) { break; }
  //       text = text.replace(link[2], this.fixLink(link[2]));
  //     }
  //   }
  //   return text;
  // }

  fixLink(linkParam: string, nameParam: string = null): string {
    const base: string = this.baseDownloadFile();
    let link = linkParam;
    let name = nameParam;
    if (link && link.indexOf(base) < 0 && link.toLowerCase().endsWith('.pdf') && this.isIE() && this.isInIframe()) {
      if (!name) {
        name = link.split('/').pop();
      }
      link = `${base}?link=${encodeURIComponent(link)}&name=${encodeURIComponent(name)}`;
    }

    return link;
  }

  protected baseDownloadFile(): string {
    return `${this.env.frontend.checkoutWrapper}/pay/download-file`;
  }

  private isIE(): boolean {
    return /MSIE|Trident/.test(window.navigator.userAgent);
  }

  private isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
}
