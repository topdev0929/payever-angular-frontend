import { ScreenTypeEnum } from "../enums";
import { FormSchemeGroupInterface, FormSchemeInterface, FormSchemeItemInterface, FormSchemeModalInterface } from "../interfaces";

export function FormControlSchemeFactory(
  controlPrefix: string,
  controlSuffix: string,
  scheme: Omit<FormSchemeItemInterface, 'controlName'>
): FormSchemeItemInterface[] {

  return scheme.screen.map((s: ScreenTypeEnum) => ({
    ...scheme,
    controlName: `${controlPrefix}${s}${controlSuffix}`,
    screen: [s],
  }));
}

export function GetFormSchemeControlNames(scheme: FormSchemeInterface): string[] {
  const getSchemeItemsName = (items?: FormSchemeItemInterface[]) => items?.map(i => i.controlName) || [];
  const getGroupControlsName = (group: FormSchemeGroupInterface) => {
    return [
      ...getSchemeItemsName(group.controls),
      ...group.modals?.reduce((acc: string[], modal: FormSchemeModalInterface) => {
        return [...acc, ...getSchemeItemsName(modal.controls)];
      }, []) || [],
    ];
  };

  return scheme.groups?.reduce((acc: string[], group: FormSchemeGroupInterface) => {

    return [...acc, ...getGroupControlsName(group)];
  }, []);
}
