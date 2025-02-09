import { Renderer2 } from '@angular/core';
import { addSeoMetadata, PebSeoModel } from './seo';

describe('addSeoMetadata', () => {
  let renderer: Renderer2;

  beforeEach(() => {
    renderer = {
      createElement: () => { },
    } as unknown as Renderer2;
    jest.spyOn(renderer, 'createElement').mockReturnValue({});
  });

  it('should return empty metaTags and elements when seo is not provided', () => {
    const seo: PebSeoModel | null = null;
    const result = addSeoMetadata(renderer, seo);

    expect(result.metaTags).toEqual([]);
    expect(result.elements).toEqual([]);
  });

  it('should add description meta tag when seo has a description', () => {
    const seo: PebSeoModel = {
      description: 'Test Description',
      customMetaTags: '',
      markupData: '',
      canonicalUrl: '',
      showInSearchResults: true,
    };
    const result = addSeoMetadata(renderer, seo);

    expect(result.metaTags).toContainEqual({
      name: 'description',
      content: 'Test Description',
    });
    expect(result.elements).toEqual([]);
  });

  it('should add custom meta tags when seo has customMetaTags', () => {
    const seo: PebSeoModel = {
      description: '',
      customMetaTags: '<meta name="author" content="John Doe"><meta name="keywords" content="angular, unit testing">',
      markupData: '',
      canonicalUrl: '',
      showInSearchResults: true,
    };
    const result = addSeoMetadata(renderer, seo);

    expect(result.metaTags).toContainEqual({
      name: 'author',
      content: 'John Doe',
    });
    expect(result.metaTags).toContainEqual({
      name: 'keywords',
      content: 'angular, unit testing',
    },);
    expect(result.elements).toEqual([]);
  });

  it('should add robots meta tag based on showInSearchResults', () => {
    const seo1: PebSeoModel = {
      description: '',
      customMetaTags: '',
      markupData: '',
      canonicalUrl: '',
      showInSearchResults: true,
    };
    const result1 = addSeoMetadata(renderer, seo1);

    expect(result1.metaTags).toContainEqual({
      name: 'robots',
      content: 'index,follow',
    });
    expect(result1.elements).toEqual([]);

    const seo2: PebSeoModel = {
      description: '',
      customMetaTags: '',
      markupData: '',
      canonicalUrl: '',
      showInSearchResults: false,
    };
    const result2 = addSeoMetadata(renderer, seo2);

    expect(result2.metaTags).toContainEqual({
      name: 'robots',
      content: 'noindex,nofollow',
    });
    expect(result2.elements).toEqual([]);
  });

  it('should add JSON-LD script tag when seo has markupData', () => {
    const seo: PebSeoModel = {
      description: '',
      customMetaTags: '',
      markupData: '{"@context":"http://schema.org","@type":"Organization","name":"Example Organization"}',
      canonicalUrl: '',
      showInSearchResults: true,
    };
    const result = addSeoMetadata(renderer, seo);

    expect(result.metaTags.length).toEqual(1);
    expect(result.elements.length).toBe(1);
    expect(renderer.createElement).toHaveBeenCalledWith('script');
  });

  it('should add canonical link tag when seo has canonicalUrl', () => {
    const seo: PebSeoModel = {
      description: '',
      customMetaTags: '',
      markupData: '',
      canonicalUrl: 'https://example.com',
      showInSearchResults: true,
    };
    const result = addSeoMetadata(renderer, seo);

    expect(result.metaTags.length).toEqual(1);
    expect(result.elements.length).toBe(1);
    expect(renderer.createElement).toHaveBeenCalledWith('link');
  });
});