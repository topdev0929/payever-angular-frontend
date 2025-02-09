import { LoginErrorReasons } from "../enums";

export interface LoginErrorsInterface {
  raw?: {
    reason: LoginErrorReasons;
    message?: LoginErrorReasons;
  },
  message?: string;
  errorBag?: { [key: string]: any };
}
