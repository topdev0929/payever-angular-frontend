import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { PebMap, PebScript, PebScriptTrigger } from '@pe/builder/core';
import { isScriptAllowed, parseExternalScript, parseInlineScript, parseLinkTag } from '@pe/builder/render-utils';
import { PebViewState } from '@pe/builder/view-state';

@Injectable()
export class PebViewScriptService implements OnDestroy {
  private renderer: Renderer2 | undefined = undefined;
  private scriptMap: PebMap<HTMLElement> = {};
  private destroy$ = new Subject<void>();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly rendererFactory: RendererFactory2,
    private store: Store,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  renderScripts(scripts: PebScript[]) {
    if (!scripts) {
      return;
    }

    scripts.forEach((script) => {
      try {
        this.renderScript(script);
      } catch (err) {
        console.error('script error:', err);
      }
    });
  }

  renderScript(script: PebScript) {
    if (!script?.id || this.scriptMap[script.id]) {
      return;
    }

    const linkTag = parseLinkTag(script.content);
    if (linkTag?.href) {
      this.addLinkTagToPage(script.id, linkTag.href, linkTag.rel);

      return;
    }

    const externalScript = parseExternalScript(script.content);
    if (externalScript?.src) {
      this.addExternalScript(script.id, externalScript.src, externalScript.type);

      return;
    }

    const inlineScript = parseInlineScript(script.content);

    if (inlineScript) {
      this.addInlineScript(
        script.id,
        inlineScript.content,
        script.triggerPoint,
        inlineScript.type,
      );

      return;
    }

    this.addInlineScript(script.id, script.content, script.triggerPoint);
  }

  getAllowedPageScriptsToRun(): PebScript[] {
    const page = this.store.selectSnapshot(PebViewState.page);
    const scripts = this.store.selectSnapshot(PebViewState.scripts);
    const permission = this.store.selectSnapshot(PebViewState.query)?.cookiesPermission;

    const allowedScripts = Object.values(scripts)
      .filter(script => script.isEnable && !script.deleted && (script.page === page?.id || !script.page))
      .filter(script => isScriptAllowed(script, permission));

    return allowedScripts;
  }

  private addLinkTagToPage(id: string, href?: string, rel?: string) {
    if (!this.renderer) {
      return;
    }
    const link = this.renderer.createElement('link');
    link.id = id;
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);

    this.scriptMap[id] = link;
    this.renderer.appendChild(this.document.head, link);
  }

  private addExternalScript(id: string, src: string, type?: string) {
    if (!this.renderer) {
      return;
    }

    const script = this.renderer.createElement('script');
    script.id = id;
    type && (script.type = type);
    script.setAttribute('src', src);

    const prefetch = this.renderer.createComment('link');
    prefetch.rel = 'prefetch';
    prefetch.href = src;

    this.scriptMap[id] = script;
    this.renderer.appendChild(this.document.head, prefetch);
    this.renderer.appendChild(this.document.body, script);
  }

  private addInlineScript(
    id: string,
    text: string,
    trigger: PebScriptTrigger,
    type?: string,
  ) {
    if (trigger !== PebScriptTrigger.PageView && this.scriptMap[id] || !this.renderer) {
      return;
    }

    const elm = this.renderer.createElement('script');
    elm.id = id;
    elm.type = type ?? 'text/javascript';

    switch (trigger) {
      case PebScriptTrigger.DOMReady:
        elm.text =
          `window.addEventListener('DOMContentLoaded', (event)=>{${text}});`;

        break;
      case PebScriptTrigger.WindowLoaded:
        elm.text = `window.addEventListener('load', (event)=>{${text}});`;

        break;
      case PebScriptTrigger.PageView:
      default:
        elm.text = text;
    }

    this.scriptMap[id] = elm;
    this.renderer.appendChild(document.body, elm);
  }

  private scriptToMap(scripts: PebScript[]): PebMap<PebScript> {
    const mapScripts: PebMap<PebScript> = {};
    scripts.forEach((script) => {
      mapScripts[script.id] = script;
    });

    return mapScripts;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
