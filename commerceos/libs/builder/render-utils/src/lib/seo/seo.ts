import {
  Renderer2,
} from '@angular/core';
import { MetaDefinition } from '@angular/platform-browser';

export interface PebSeoModel {
  description: string,
  customMetaTags: string,
  markupData: string,
  canonicalUrl: string,
  showInSearchResults: boolean
}

export function addSeoMetadata(renderer: Renderer2, seo: PebSeoModel | null):
  { metaTags: MetaDefinition[], elements: any[] } {
  if (!seo) {

    return { metaTags: [], elements: [] };
  }

  const metaTags: MetaDefinition[] = [];

  if (seo.description) {
    metaTags.push({
      name: 'description',
      content: seo.description,
    });
  }

  if (seo.customMetaTags) {
    const metaTagMatches = seo.customMetaTags.match(/<meta[^>]+>/g);

    if (metaTagMatches) {
      metaTagMatches.forEach((metaTag) => {
        const nameMatch = /name="([^"]+)"/.exec(metaTag);
        const contentMatch = /content="([^"]+)"/.exec(metaTag);

        if (nameMatch && contentMatch) {
          const name = nameMatch[1];
          const content = contentMatch[1];

          metaTags.push({
            name: name,
            content: content,
          });
        }
      });
    }
  }

  const robotsMetaTag: MetaDefinition = {
    name: 'robots',
    content: seo.showInSearchResults ? 'index,follow' : 'noindex,nofollow',
  };
  metaTags.push(robotsMetaTag);

  const elements = [];

  if (seo.markupData) {
    const parsedMarkupData = JSON.parse(seo.markupData);
    if (parsedMarkupData) {
      const scriptTag = renderer.createElement('script');
      scriptTag.type = 'application/ld+json';
      scriptTag.textContent = JSON.stringify(parsedMarkupData);
      elements.push(scriptTag);
    }
  }

  if (seo.canonicalUrl) {
    const linkTag = renderer.createElement('link');
    linkTag.rel = 'canonical';
    linkTag.href = seo.canonicalUrl;
    elements.push(linkTag);
  }

  return {
    metaTags: metaTags,
    elements: elements,
  };
}
