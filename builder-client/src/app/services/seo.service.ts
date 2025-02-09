import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoSettingsInterface } from '../../interfaces/interfaces-v2';

@Injectable({
  providedIn: 'root',
})
export class SeoService {

  constructor(
    private readonly metaService: Meta,
    private readonly titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {
  }

  addMarkupToHead(markup: string): void {
    this.document.head.insertAdjacentHTML('beforeend', markup);
  }

  setData(data: SeoSettingsInterface): void {
    const keys: string[] = Object.keys(data);

    if (keys.indexOf('title') >= 0) {
      this.setTitle(data.title);
    }

    if (keys.indexOf('description') >= 0) {
      this.setMetaDescription(data.description);
    }

    if (keys.indexOf('canonicalUrl') >= 0) {
      this.setCanonicalUrl(data.canonicalUrl);
    }

    if (keys.indexOf('noIndex') >= 0) {
      this.setNoIndex(data.noIndex)
    }

    if (keys.indexOf('jsonLd') >= 0) {
      this.setJsonLd(data.jsonLd);
    }
  }

  private setTitle(title: string = ''): void {
    this.titleService.setTitle(title);
    if (title && title.length) {
      this.metaService.updateTag({name: 'twitter:title', content: title});
      this.metaService.updateTag({name: 'twitter:image:alt', content: title});
      this.metaService.updateTag({property: 'og:image:alt', content: title});
      this.metaService.updateTag({property: 'og:title', content: title});
      this.metaService.updateTag({name: 'title', content: title});
    } else {
      this.metaService.removeTag(`name='twitter:title'`);
      this.metaService.removeTag(`name='twitter:image:alt'`);
      this.metaService.removeTag(`property='og:image:alt'`);
      this.metaService.removeTag(`property='og:title'`);
      this.metaService.removeTag(`name='title'`);
    }
  }

  private setMetaDescription(description?: string): void {
    if (description && description.length) {
      this.metaService.updateTag({ name: 'twitter:description', content: description });
      this.metaService.updateTag({ property: 'og:description', content: description });
      this.metaService.updateTag({ name: 'description', content: description });
    } else {
      this.metaService.removeTag(`name='twitter:description'`);
      this.metaService.removeTag(`property='og:description'`);
      this.metaService.removeTag(`name='description'`);
    }
  }

  private setNoIndex(noIndex: boolean): void {
    if (noIndex) {
      this.metaService.updateTag({ name: 'robots', content: 'noindex' });
    } else {
      this.metaService.removeTag('name=robots');
    }
  }

  private setCanonicalUrl(url?: string): void {
    let linkEl: HTMLLinkElement = this.document.querySelector('link[rel=canonical]');
    if (url && url.length) {
      if (!linkEl) {
        linkEl = this.document.createElement('link' );
        linkEl.setAttribute('rel', 'canonical');
        this.document.head.appendChild(linkEl);
      }
      linkEl.href = url;

      this.metaService.updateTag({property: 'og:url', content: url});
    } else {
      if (linkEl) {
        linkEl.remove();
      }

      this.metaService.removeTag(`property='og:url'`);
    }
  }

  private setJsonLd(jsonLdText: string): void {
    let scriptEl: HTMLScriptElement = this.document.head.querySelector(`script[type='application/ld+json']`);

    if (jsonLdText && jsonLdText.length) {
      if (!scriptEl) {
        scriptEl = this.document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        this.document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = jsonLdText;
    } else {
      if (scriptEl) {
        scriptEl.remove();
      }
    }
  }
}
