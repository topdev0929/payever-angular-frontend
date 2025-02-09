import { CHECK_OFF_ICON, PAYEVER_ICON, changeInnerHtml, changeSrc, toggleClass } from '../common/index';

const logoUploaderField: HTMLInputElement = document.getElementById('logo-uploader') as HTMLInputElement;

const handleLogoChange = (event: Event): void => {
  const { files } = event.target as HTMLInputElement;
  if ((files ?? []).length > 0) {
    if (isValidFormat(files![0].name)) {
      changeSrc('form-logo', URL.createObjectURL(files![0]));
    }
  }
  else {
    changeSrc('payever-logo', CHECK_OFF_ICON);
    toggleClass('payever-logo', 'active', true);
  }
};

logoUploaderField.addEventListener('change', handleLogoChange);

export const setLogo = (logo = 'payever'): void => {
  changeInnerHtml('logo-label', logo);
  if (logo === 'payever') {
    changeSrc('form-logo', PAYEVER_ICON);
    logoUploaderField.value = '';
  }
};

const isValidFormat = (fileName: string): boolean => {
  const validExtensions = ['jpg', 'jpeg', 'gif', 'png', 'bmp'];
  if(fileName.split('.').pop()) {
    return validExtensions.some(a => a === fileName.split('.').pop()!.toLowerCase())
  }
  return false;
};
