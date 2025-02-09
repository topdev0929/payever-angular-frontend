import { isDevMode } from '@angular/core';

export function loadStyles(files: {name: string, id?: string}[], excludeBy?: string[]) {
  if (excludeBy?.length) {
    for (const file of excludeBy) {
      if (document.getElementById(file)) {
        return;
      }
    }
  }


  const head = document.getElementsByTagName('head')[0];
  for (const file of files) {
    const href = isDevMode() ? `/${file.name}.css` : `MICRO_COMMERCEOS_VERSION/${file.name}.css`;
    const el = document.getElementById(file.id ?? '');

    if (el) {
      (el as HTMLLinkElement).href = href;
    } else {
      const newEl = document.createElement('link');
      newEl.rel = 'stylesheet';
      newEl.href = href;
      newEl.id = file.id ?? file.name;
      head.appendChild(newEl);
    }
    if (file.id === 'pe-theme'){
      document.querySelector("meta[name='theme-color']").setAttribute("content", file.name === 'light' ? "#f2f2f6" : "#24272e");
    }
  }
}

export function removeStyle(styleId: string) {
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.parentNode?.removeChild(existingStyle);
    if (styleId === 'pe-theme'){
      document.querySelector("meta[name='theme-color']").setAttribute("content", "#24272e");
    }
  }
}
