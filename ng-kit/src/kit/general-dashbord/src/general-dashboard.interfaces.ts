export interface GeneralDashboardItemInterface {
  title: string;
  description: string;
  btnsMoreLess?: {
    btnLessName: string;
    btnMoreName: string;
  };
  subItems: GeneralDashboardSubItemInterface[];
}

export interface GeneralDashboardSwitcherInterface {
  isChecked: boolean;
  switcherChangeHandler?: (event: Event) => void;
}

export interface GeneralDashboardSubItemInterface {
  imgSrc: string;
  name: string;
  description: string;
  lbReadMore: string;
  btnGroup: GeneralDashboardButtonGroupInterface;
  switcher?: GeneralDashboardSwitcherInterface;
  isDisabled?: boolean;
}

export interface GeneralDashboardButtonInterface {
  btnName: string;
  btnClickHandler?: () => void;
}

export interface GeneralDashboardButtonGroupInterface extends GeneralDashboardButtonInterface {
  btnDropdown?: GeneralDashboardButtonInterface[];
}
