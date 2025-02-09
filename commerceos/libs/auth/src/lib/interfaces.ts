import { AuthTokenType } from './enums';

export interface LoginPayload {
  email: string;
  plainPassword?: string;
  encryptedPassword?: string;
  language?: string;
}

export interface LoginResponse {
  isDomainTrusted?: boolean,
  isVerified?: boolean,
  needApproval?: boolean,
  accessToken: string;
  refreshToken: string;
  isSecurityQuestionDefined?: boolean;
}

export interface RegisterPayload {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  forceGeneratePassword?: boolean;
  recaptchaToken?: string;
  inviteToken?: string;
  language?: string;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserData {
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: any;
  tokenType?: AuthTokenType;
}

export interface AuthTokenPayload {
  email?: string;
  firstName?: string;
  lastName?: string;
  tokenId?: string;
  userId?: string;
}

export interface ExtraLoginData {
  activeBusiness: any;
  email?: string;
}

export interface IErrorEntryDetails {
  children: any[];
  constraints: {
    [key: string]: string;
  };
  property: string;
  value: string;
}

export interface IErrorEntryResponse {
  error: {
    errors: IErrorEntryDetails[];
    message: string;
    reason?: string;
    statusCode: number;
  };
  message: string;
}

export interface SetTokensInterface {
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

export interface CreateUserAccountConfigInterface {
  hasUnfinishedBusinessRegistration?: boolean;
}

export interface SecurityQuestionInterface {
  question: string;
}

export interface SecurityQuestionPayloadInterface {
  answer: string;
  recaptchaToken: string;
}

export interface SecurityAnswerInterface {
  answer: string;
}
