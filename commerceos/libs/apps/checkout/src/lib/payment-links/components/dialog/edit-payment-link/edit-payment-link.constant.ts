export interface ShareSocialInterface {
  disabled: boolean;
  payload: LinkActionsEnum;
  icon: string;
  name: string;
}

export enum LinkActionsEnum {
  link,
  prefill,
  share,
}

export const SOCIAl_MEDIA_OPTIONS: ShareSocialInterface[] = [
  {
    disabled: false,
    payload: LinkActionsEnum.prefill,
    icon: "icon-transactions-edit-16",
    name: 'paymentLinks.actions.prefill',
  },
];
