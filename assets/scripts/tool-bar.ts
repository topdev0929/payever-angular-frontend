import { setLanguage, setDevice, setFontFamily, setColors, setCorner, setIndustry, setLogo } from './tools/index';
import { loadTranslations } from './languages';
import { CHECK_OFF_ICON, CHECK_ON_ICON, changeSrc, isMobileDevice, throttle, toggleClass } from './common/index';
import { outSideClickHandler } from './set-click-outside';

export let activeElement: HTMLElement;

const toolBarItems: HTMLCollectionOf<HTMLImageElement> = document.getElementsByClassName('tool-bar-item') as HTMLCollectionOf<HTMLImageElement>;
const dropdownItems: HTMLCollectionOf<HTMLImageElement> = document.getElementsByClassName('dropdown-tool-bar') as HTMLCollectionOf<HTMLImageElement>;
const toolBarPillLabels: HTMLCollectionOf<HTMLImageElement> = document.getElementsByClassName('tool-bar-pill-label') as HTMLCollectionOf<HTMLImageElement>;
const itemBars: HTMLCollectionOf<HTMLImageElement> = document.getElementsByClassName('item-bar') as HTMLCollectionOf<HTMLImageElement>;

const resetRadio = (radioElements: HTMLCollectionOf<HTMLImageElement>): void => {
  [...radioElements].forEach((element) => {
    element.src = CHECK_OFF_ICON;
    element.classList.remove('active');
  });
};

const setRadio = (radioName?: string): void => {
  if (radioName) {
    const radioElements: HTMLCollectionOf<HTMLImageElement> = document.getElementsByClassName(radioName) as HTMLCollectionOf<HTMLImageElement>;
    [...radioElements].forEach((element) => {
      element.addEventListener('click', () => {
        resetRadio(radioElements);
        handleRadioEvent(element);
      });
    });
  }
};

const handleRadioEvent = (element: HTMLImageElement): void => {
  const text = element.dataset.text ?? '' as any;

  switch (element.name) {
    case 'language':
      setLanguage(text);
      break;
    case 'device':
      setDevice(text);
      break;
    case 'corner':
      setCorner(text);
      break;
    case 'font':
      setFontFamily(text);
      break;
    case 'industry':
      setIndustry(text);
      break;
    case 'logo':
      setLogo(text);
      break;
  }
  resetToolBarItems();
  element.src = CHECK_ON_ICON;
  element.classList.add('active');
}

export const resetToolBarItems = (): void => {
  [...toolBarPillLabels].forEach((element, i) => {
    element.classList.remove('active');
    dropdownItems[i].classList.remove('show');
  });
  [...toolBarItems].forEach((element, i) => {
    toolBarItems[i].classList.remove('show');
  });
};

const toggleToolbarItems = (index: number): void => {
  [...toolBarItems].forEach((element) => {
    if (+(element.dataset.index ?? '-1') == index) {
      element.classList.add('show');
    }
  });
};

const setStyleButtons = (): void => {
  const colorItem = document.getElementById('color-toolbar-item')!;
  const cornerItem = document.getElementById('corner-toolbar-item')!;
  const cornerDropdown = document.getElementById('corner-dropdown')!;
  colorItem.addEventListener('click', () => {
    cornerDropdown.classList.remove('show');
  });
  cornerItem.addEventListener('click', () => {
    cornerDropdown.classList.add('show');
  });
};

const togglePillLabels = (): void => {
  [...toolBarPillLabels].forEach((element, i) => {
    element.addEventListener('click', () => {
      let radio_name = dropdownItems[i].dataset.text;
      resetToolBarItems();
      dropdownItems[i].classList.add('show');
      toggleToolbarItems(i);
      setRadio(radio_name);
      activeElement = itemBars[i];
      if (activeElement.dataset.name === 'style') {
        dropdownItems[i].classList.remove('show');
      }
    });
  });
};


const detectDefaultDevice = (): void => {
  const isMobile = isMobileDevice();
  setDevice(isMobile ? 'mobile' : 'desktop');
  changeSrc('mobile-device', isMobile ? CHECK_ON_ICON : CHECK_OFF_ICON);
  changeSrc('desktop-device', isMobile ? CHECK_OFF_ICON : CHECK_ON_ICON);
  toggleClass('mobile-device', 'active', isMobile);
  toggleClass('desktop-device', 'active', !isMobile);
}

window.onload = async () => {
  detectDefaultDevice();
  togglePillLabels();
  setStyleButtons();
  await loadTranslations();
  setLanguage('germany');
  setColors();
  outSideClickHandler();
  window.addEventListener('resize', throttle(() => {
    detectDefaultDevice();
  }, 320));
};