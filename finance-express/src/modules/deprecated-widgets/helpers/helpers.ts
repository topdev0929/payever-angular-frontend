export function camelCased(name: string): string {
  return `-${name}`.replace(/-([a-z])/g, (str, p1) => p1.toUpperCase());
}

export function addClass(element: HTMLElement, className: string): void {
  element.className += ` ${className}`;
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return `${element.className}`.indexOf(`${className}`) > -1;
}

export function removeClass(element: HTMLElement, removeClassName: string): string {
  let className;
  const newClassName = [];
  for (className of element.className.split(' ')) {
    if (className !== removeClassName) {
      newClassName.push(className);
    }
  }
  return element.className = newClassName.join(' ');
}
