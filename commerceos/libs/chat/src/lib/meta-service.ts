import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable({
  providedIn: 'root',
})
export class MetaService {
  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private environmentConfig: EnvironmentConfigInterface,
    private store: Store,
    ) {}

  getMetaTags(url: string): Observable<string> {
    return this.http.get(`${this.environmentConfig.backend.message}/api/get-meta?url=${url}`, { responseType: 'text' });
  }

  public extractFirstLink(text: string): string | null {
    if (!text) {
      return null;
    }
    const linkPattern = /http[s]?:\/\/(?:[a-zA-Z]|\d|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+/g;
    const match = text.match(linkPattern);

    if (match && match.length > 0) {
      return match[0];
    } else {
      return null;
    }
  }

  prepareDataUrl(message: any) {
    if (message.urlContent){
      return;
    }

    const messageUrl = this.extractFirstLink(message.content);

    if (!messageUrl ) {
      return;
    }
    const linkData = {
      title: '',
      siteName: '',
      siteUrl: '',
      description: '',
      img: '',
      state: false,
      url: messageUrl,
    };
    try {
      const url = new URL(messageUrl);
      const protocol = url.protocol === 'https:' ? 'https' : 'http';
      linkData.siteUrl = `${protocol}://${url.hostname}`;
    } catch (error) {}

    this.getMetaTags(messageUrl)
      .pipe(
        tap((html: string) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          const titleTag = doc.querySelector('title');
          const descriptionTag = doc.querySelector('meta[name="description"]');

          const openGraphImageTag = doc.querySelector('meta[property="og:image"]');
          const twitterImageTag = doc.querySelector('meta[name="twitter:image"]');

          const openGraphSiteNameTag = doc.querySelector('meta[property="og:site_name"]');

          if (openGraphSiteNameTag) {
            linkData.siteName = openGraphSiteNameTag.getAttribute('content');
          }

          if (openGraphImageTag || twitterImageTag) {
            linkData.img = (openGraphImageTag || twitterImageTag).getAttribute('content');
            linkData.state = true;
          }

          if (titleTag) {
            linkData.title = titleTag.innerText;
            linkData.state = true;
          }

          if (descriptionTag) {
            linkData.description = descriptionTag.getAttribute('content');
            linkData.state = true;
          }
        }),
      )
      .subscribe();
  }
}
