import { pebColorToCss, getGradientStyle } from '@pe/builder/color-utils';

export class PebQuillRenderer {

  static render(value: { ops: any[] }) {
    const parts = processOps(value.ops);

    return parts.join('');
  }
}

export const processOps = (ops: any[]): string[] => {
  let chunks: any[] = [];
  const result = Object.values(ops || {}).filter(op => !!op).reduce((acc: string[], op) => {
    const { insert, attributes } = op;
    if (insert) {
      const tokens = tokenize(insert);
      tokens.forEach((token) => {
        if (token === '\n') {
          if (chunks.length) {
            acc.push(endLine(chunks.join(''), attributes));
            chunks = [];
          } else {
            acc.push(endLine('', attributes));
          }
        } else {
          chunks.push(chunk(token, attributes));
        }
      });
    }

    return acc;
  }, []);

  /** In case Delta does not have trailing new line */
  if (chunks.length) {
    result.push(endLine(chunks.join('')));
  }

  return result;
};

export const endLine = (line: string, attributes = { align: 'left' }) => {
  const { align } = attributes;
  let quillClass = '';
  switch (align) {
    case 'left':
      break;
    case 'right':
      quillClass = 'ql-align-right';
      break;
    case 'center':
      quillClass = 'ql-align-center';
      break;
    case 'justify':
      quillClass = 'ql-align-justify';
      break;
  }

  if (quillClass) {
    return `<p class="${quillClass}">${line ?? '<br/>'}</p>`;
  }

  return `<p>${line ?? '<br/>'}</p>`;
};


export const chunk = (text: string, attributes = []): string => {
  const tags: any[] = [];
  const styles: any[] = [];
  Object.entries(attributes).forEach(([attr, value]) => {
    if (value !== undefined) {
      switch (attr) {
        case 'italic': {
          value && tags.push('em');
          break;
        }
        case 'link': {
          const { type, payload } = value;
          const dataset = Object.entries(payload || {}).reduce((acc, [key, v]) => {
            if (v) {
              return acc.concat(` data-${key}="${v}"`);
            }

            return acc;
          }, ``);
          tags.push(`a href="#" peb-link-action="${type}" ${dataset}`);
          break;
        }
        case 'underline': {
          value && tags.push('u');
          break;
        }
        case 'strike': {
          value && tags.push('s');
          break;
        }
        case 'fontFamily': {
          const fontFamily = /\s/.test(value) ? `'${value}'` : value;
          styles.push({ value: `${fontFamily}`, property: 'font-family' });
          break;
        }
        case 'color': {
          styles.push({ value: pebColorToCss(value), property: attr });
          break;
        }
        case 'fontSize': {
          styles.push({ value: `${value}px`, property: 'font-size' });
          break;
        }
        case 'letterSpacing': {
          styles.push({ value: `${value}px`, property: 'letter-spacing' });
          break;
        }
        case 'lineHeight': {
          value >= 0 && styles.push({ value: `${value}px`, property: 'line-height' }, { value: 'inline-block', property: 'display' });
          break;
        }
        case 'fontWeight': {
          styles.push({ value, property: 'font-weight' });
          break;
        }
        case 'fill': {
          if (value) {
            styles.push({ value: typeof value === 'string' ? value : getGradientStyle(value), property: 'background-image' });
            styles.push({ value: 'text', property: '-webkit-background-clip' });
            styles.push({ value: 'transparent', property: '-webkit-text-fill-color' });
          }
        }
      }
    }
  });

  /** Wrap content in a `span` element if there is some styles to apply but no tags */
  if (styles.length > 0 && tags.length === 0) {
    tags.push('span');
  }

  const opening = tags.slice().reverse()
    .reduce((acc, tag, index) => {
      if (index === 0 && styles.length > 0) {
        const inlineStyles = styles.map(({ property, value }) => `${property}: ${value};`);
        acc.push(`<${tag} style="${inlineStyles.join(' ')}">`);
      } else {
        acc.push(`<${tag}>`);
      }

      return acc;
    }, []).join('');

  const closing = tags.map(tag => /href/.test(tag) ? '</a>' : `</${tag}>`).join('');

  return `${opening}${text}${closing}`;
};


/**
 *  Splits by new line character ("\n") by putting new line characters into the
 *  array as well. Ex: "hello\n\nworld\n " => ["hello", "\n", "\n", "world", "\n", " "]
 */
export const tokenize = (str: string): string[] => {
  const newLine = '\n';

  if (str === newLine) {
    return [str];
  }

  const lines = str.split(newLine);

  if (lines.length === 1) {
    return lines;
  }

  const lastIndex = lines.length - 1;

  return lines.reduce((acc: string[], line: string, index: number) => {
    if (line !== '') {
      acc.push(line);
    }

    if (index !== lastIndex) {
      acc.push(newLine);
    }

    return acc;
  }, []);
};
