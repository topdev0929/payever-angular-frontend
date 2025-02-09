import { isArray, isPlainObject } from 'lodash';

export function toTransferObjectScript(data: any): string {
  const obj = toTransferObject(data);

  return `<script id="peb-state">const pebState = ${obj};</script>
`;
}

export function toTransferObject(data: any): string {
  return toObjectStringRecursive(data);
}

function toObjectStringRecursive(obj: any) {
  if (isPlainObject(obj)) {
    return toObjectString(obj);
  }

  if (isArray(obj)) {
    return toArrayString(obj);
  }

  if (typeof obj === 'number' || typeof obj === 'boolean' || obj === undefined || obj === null) {
    return `${obj}`;
  }

  return `\`${obj}\``;
}


function toArrayString(obj: any): string {
  const expressions: string[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    expressions.push(toObjectStringRecursive(value));
  });

  return '[' + expressions.filter(Boolean).join(',') + ']';
}


function toObjectString(obj: any): string {
  const expressions: string[] = [];
  Object.entries(obj).forEach(([key, value]) => {
    expressions.push(`'${key}':${toObjectStringRecursive(value)}`);
  });

  return '{' + expressions.filter(Boolean).join(',') + '}';
}