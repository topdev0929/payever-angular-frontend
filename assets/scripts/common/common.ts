export const toggleClass = (elementId: string, className: string = "show", toggle: boolean = true): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle(className, toggle);
  }
};

export const showElement = (elementId: string, show: boolean = true): void => {
  toggleClass(elementId, "show", show);
};

export const changeSrc = (elementId: string, src: string): void => {
  const element = document.getElementById(elementId);
  if (element && element instanceof HTMLImageElement) {
    element.src = src;
  }
};

export const changeSrcByClassNames = (classNames: string, src: string): void => {
  const elements = document.getElementsByClassName(classNames) as HTMLCollectionOf<HTMLImageElement>;
  [...elements].forEach((element) => {
      if (element && element instanceof HTMLImageElement) {
        element.src = src;
      }
  });
};

export const changeInnerHtml = (elementId: string, data: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = data;
  }
};

export const changeInnerHtmlByClassNames = (classNames: string, data: string): void => {
  const elements = document.getElementsByClassName(classNames) as HTMLCollectionOf<HTMLElement>;
  [...elements].forEach((element) => {
    if (element && element instanceof HTMLElement) {
      element.innerHTML = data;
    }
  });
};

export const hasClass = (identifier: string, className: string): boolean => {
  const element: HTMLElement | null = document.querySelector(`#${identifier}, .${identifier}`);
  if (element) {
    return element.classList.contains(className)
  }
  return false;
};

export const isMobileDevice = (): boolean => {
  return window.innerWidth <= 768;
};

export const throttle = <T extends (...args: any[]) => any>(func: T, ms: number): (...args: Parameters<T>) => void => {
  let skip: boolean;
  return function(this: any, ...args: Parameters<T>): void {
    if (!skip) {
        func.apply(this, args);
        skip = true;
        setTimeout(() => skip = false, ms);
    }
  };
};