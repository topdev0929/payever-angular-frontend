import { XMLParser, XMLValidator } from 'fast-xml-parser';

export const isSvg = (text: string): boolean => {
  if (typeof text !== 'string') {
    throw new TypeError(`Expected a \`string\`, got \`${typeof text}\``);
  }

  text = text.trim();

  if (text.length === 0) {
    return false;
  }

  // Has to be `!==` as it can also return an object with error info.
  if (XMLValidator.validate(text) !== true) {
    return false;
  }

  let jsonObject;
  const parser = new XMLParser();

  try {
    jsonObject = parser.parse(text);
  } catch {
    return false;
  }

  if (!jsonObject) {
    return false;
  }

  if (!('svg' in jsonObject)) {
    return false;
  }

  return true;
};
