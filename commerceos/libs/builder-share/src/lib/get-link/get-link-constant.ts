export interface BuilderShareSocialInterface {
  disabled: boolean;
  image: string;
  payload: BuilderShareSocialEnum;
  alt: string;
  name: string;
}

export enum BuilderShareSocialEnum {
  link,
  facebook,
  instagram,
  twitter,
  pinterest,
  email,
}

export const SOCIAl_MEDIA_OPTIONS: BuilderShareSocialInterface[] = [
  {
    disabled: true,
    image: '/assets/builder-share/icons/Link.svg',
    payload: BuilderShareSocialEnum.link,
    alt: "Link",
    name: 'builder-app.share.link',
  },
  {
    disabled: false,
    image: '/assets/builder-share/icons/Facebook.svg',
    payload: BuilderShareSocialEnum.facebook,
    alt: "Facebook",
    name: 'builder-app.share.facebook',
  },
  {
    disabled: true,
    image: '/assets/builder-share/icons/Instagram.svg',
    payload: BuilderShareSocialEnum.instagram,
    alt: "Instagram",
    name: 'builder-app.share.instagram',
  },
  {
    disabled: false,
    image: '/assets/builder-share/icons/Twitter.svg',
    payload: BuilderShareSocialEnum.twitter,
    alt: "X",
    name: 'builder-app.share.twitter',
  },
  {
    disabled: true,
    image: '/assets/builder-share/icons/Pinterest.svg',
    payload: BuilderShareSocialEnum.pinterest,
    alt: "Pinterest",
    name: 'builder-app.share.pinterest',
  },
  {
    disabled: false,
    image: '/assets/builder-share/icons/Email.svg',
    payload: BuilderShareSocialEnum.email,
    alt: "Email",
    name: 'builder-app.share.email',
  },
];
