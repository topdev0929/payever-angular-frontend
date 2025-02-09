export interface LoginPayload {
  email: string;
  plainPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  forceGeneratePassword?: boolean;
  recaptchaToken?: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}
