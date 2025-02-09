export interface RegistrationPayloadInterface {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  inviteToken?: string;
  language: string;
}

export interface RegistrationFormDataInterface {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPass: string;
}
