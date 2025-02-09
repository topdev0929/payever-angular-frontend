import { PebScript, PebViewCookiesPermission } from '@pe/builder/core';


export function parseExternalScript(str: string): { src: string, type?: string } | undefined {
  const { tag, attributes } = parseTagAndAttributes(str) ?? {};

  return tag === 'script' ? { src: attributes?.src ?? '', type: attributes?.type } : undefined;
}

export function parseLinkTag(str: string): { href?: string, rel?: string } | undefined {
  const { tag, attributes } = parseTagAndAttributes(str) ?? {};

  return tag === 'link' ? { href: attributes?.href, rel: attributes?.rel } : undefined;
}

export function parseInlineScript(str: string): { content: string, type?: string } | undefined {
  const { attributes } = parseTagAndAttributes(str) ?? {};
  const content = parseTagContent(str, 'script');

  return content ? { content, type: attributes?.type } : undefined;
}

export function isScriptAllowed(script: PebScript, permissions: PebViewCookiesPermission | undefined): boolean {
  if (!script) {
    return false;
  }

  if (!script.needPermission) {
    return true;
  }

  return permissions?.isAllowed ?? false;
}

function parseTagAndAttributes(str: string)
  : { tag: string, attributes: { [key: string]: string } } | undefined {
  const regex = /[\s]*<(\w*) ([^>^<]*)>/gmi;
  const m = regex.exec(str);

  if (!m) {
    return undefined;
  }

  const tag = m[1];
  const attributes = getKeyValues(m[2]);

  return { tag, attributes };
}

function parseTagContent(str: string, tag: string): string {
  const regex = new RegExp(`\\s*<${tag}[^>]*>([\\w\\s\\W]*)<\\/${tag}>\\s*`, 'gm');

  const m = regex.exec(str);

  if (!m) {
    return '';
  }

  return m[1];
}

function getKeyValues(str: string): { [key: string]: string } {
  const regex = /\s*([\w0-9]+)\s*=\s*(("([^"]*)")|('([^']*)'))/gmi;
  let m;
  let res: any = {};

  do {
    m = regex.exec(str);
    m && (res[m[1]] = m[4] || m[6]);
  } while (m);

  return res;
}

export function extractIframeSrc(str: string): string | undefined {
  const regex = /[\s]*iframe\.src\s*=\s*['|"]([\w:/\-.?=&]*)['|"];/gmi;
  let m;
  let res: string | undefined = undefined;

  do {
    m = regex.exec(str);
    m && (res = m[1]);
  } while (m);

  return res;
}
