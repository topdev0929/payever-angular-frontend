import { extractIframeSrc, parseExternalScript, parseInlineScript, parseLinkTag } from './script.utils';

describe('Script utils', () => {
  it('should parse external script tag', () => {
    const content1 = `<script src='http://test.com/test.js?param=123' href='2' defer></script>`;
    const content2 = `<script src="http://test.com/test.js?param=123" ref="2" defer></script>`;

    expect(parseExternalScript(content1)).toEqual({
      src: 'http://test.com/test.js?param=123',
    });

    expect(parseExternalScript(content2)).toEqual({
      src: 'http://test.com/test.js?param=123',
    });
  });

  it('should parse link tag', () => {
    const content = `<link rel="stylesheet" href='123'>`;

    expect(parseLinkTag(content)).toEqual({
      rel: 'stylesheet',
      href: '123'
    });
  });

  it('should parse inline script', () => {
    const content = `<script>console.log('test');</script>`;

    expect(parseInlineScript(content)).toEqual({ content: `console.log('test');` });
    expect(parseInlineScript('   ' + content + '  ')).toEqual({ content: `console.log('test');` });
    expect(parseInlineScript('invalid content')).toBeUndefined();
  });

  it('should detect script type for inline script', () => {
    const json = `{
      "imports": {
        "three": "https://threejs.org/build/three.module.js"					
      }
    }`;
    const content = `<script type="importmap">${json}</script>`;

    expect(parseInlineScript(content)).toEqual({ content: json, type: 'importmap' })
  });

  it('should detect script type for script tag', () => {
    const content = `<script type="module" src='test'></script>`;

    expect(parseExternalScript(content)).toEqual({ src: 'test', type: 'module' })
  });

  it('should extract iframe src from script', () => {
    const content = `
    var iframe = document.createElement('iframe');
    iframe.src =  'https://payever-ci-connected-commerce.vercel.app/';
    
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);    
    `;

    expect(extractIframeSrc(content)).toEqual('https://payever-ci-connected-commerce.vercel.app/');
    expect(extractIframeSrc('invalid')).toEqual(undefined);
  });
})