export interface RegisterDto {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  forceGeneratePassword?: boolean;
  recaptchaToken?: string;
  inviteToken?: string;
  language?: string;
}

export interface RegisterData extends Omit<RegisterDto, 'language'> {
  country: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserAccountConfigDto {
  hasUnfinishedBusinessRegistration?: boolean;
  registrationOrigin?: RegistrationOrigin;
}

interface RegistrationOrigin {
  url: string;
  account: 'personal';
}
