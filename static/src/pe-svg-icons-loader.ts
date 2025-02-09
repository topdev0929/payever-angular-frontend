export interface EnvironmentConfigInterface {
  custom: {
    cdn: string;
  };
}

export class PeSvgIconsLoader {

  private loadedIcons: string[] = [];

  public loadIcons(icons: string[], hash: string | null = null, shadowRoot: HTMLElement | null = null): void {
    for (const icon of icons) {
      if (!this.checkIsIconLoaded(icon)) {
        this.loadIconJsLoader(icon, 'MICRO_URL_CUSTOM_CDN', hash, shadowRoot);
      } else if (shadowRoot) {
        this.addIconsToShadowRoot(icon, shadowRoot);
      }
    }
  }

  private checkIsIconLoaded(iconName: string): boolean {
    const containers = document.getElementsByClassName('pe-svg-icons-container');
    return this.loadedIcons.indexOf(iconName) >= 0 || (
      containers && containers.length ?
        (containers[0].querySelector(`symbol[id="icon-${iconName}"]`) !== null) :
        false
    );
  }

  private loadIconJsLoader(iconName: string, cdnBase: string, hash: string | null = null, shadowRoot: HTMLElement | null = null) {
    this.loadedIcons.push(iconName);
    const now = new Date();
    if (hash === '[PE_HASH]') {
      hash = null; // Small hack if postbuild script can't replace hash
    }
    hash = hash || (window as any).PE_HASH || `${now.getDay()}-${now.getMonth()}-${now.getFullYear()}`;
    const scriptEl: HTMLScriptElement = document.createElement('script');
    scriptEl.src = `${cdnBase}/icons-js/pe-icon-${iconName}.js?${hash}`;
    scriptEl.onload = () => {
      this.addIconsToShadowRoot(iconName, shadowRoot);
    };
    (document.head as HTMLScriptElement).appendChild(scriptEl);
  }

  private addIconsToShadowRoot(iconName: string, shadowRoot: HTMLElement | null = null) {
    if (!shadowRoot) {
      return;
    }
    const iconContainerClass = 'pe-svg-icons-container';
    const containers = document.getElementsByClassName(iconContainerClass);
    const existing = containers.length
      ? containers[0].querySelector(`symbol[id="icon-${iconName}"]`)
      : null
    const iconsContainerElems = shadowRoot.querySelectorAll(`.${iconContainerClass}`);
    let iconsContainerEl = iconsContainerElems && iconsContainerElems.length ? iconsContainerElems[0] : null;

    if (!iconsContainerEl) {
      iconsContainerEl = document.createElement('div');
      iconsContainerEl.className = iconContainerClass;
      shadowRoot.appendChild(iconsContainerEl);
    }

    if (shadowRoot && existing) {
      iconsContainerEl.appendChild(existing.parentElement.cloneNode(true));
    }
  }
}
