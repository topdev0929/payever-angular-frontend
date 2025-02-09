import { CAR_IMG, DRONE_CAMERA_IMG, PRICES, changeInnerHtml, changeSrcByClassNames, changeInnerHtmlByClassNames } from '../common/index';
import { languageActive } from './set-language';
import { getTranslations } from '../languages';
import { getPaymentDemoSettings } from '../../apps';

export let selectedIndustry: IndustryType = 'Technology';

const { stepsIndustryHandler } = getPaymentDemoSettings();
const priceTexts: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName('price-text') as HTMLCollectionOf<HTMLElement>;

const setPriceTexts = (industry: IndustryType): void => {
  if (industry) {
    [...priceTexts].forEach((el) => {
      el.innerHTML = PRICES[industry];
    });
  }
};

export const setIndustry = async (industry: IndustryType): Promise<void> => {
  const languageText = getTranslations();
  const labelText: string = languageText[industry][languageActive];
  const productName = industry === 'Technology' ? 'Drone Camera' : 'MACH-E® Pre...';
  const productImg = industry === 'Technology' ? DRONE_CAMERA_IMG : CAR_IMG;

  selectedIndustry = industry;
  changeSrcByClassNames('product-img', productImg);
  changeInnerHtmlByClassNames('product-name', productName);
  changeInnerHtml('industry-label', labelText);

  if (stepsIndustryHandler) {
    stepsIndustryHandler();
    return;
  }
  
  setPriceTexts(industry);
}

export type IndustryType = 'Technology' | 'Car';