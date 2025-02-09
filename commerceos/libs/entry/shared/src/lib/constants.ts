import { LoginErrorReasons } from "./enums";

export const BLOCK_EMAIL_REASONS = [
  LoginErrorReasons.PermanentBan,
  LoginErrorReasons.ThreeHoursBan,
  LoginErrorReasons.TwentyMinutesBan,
  LoginErrorReasons.WrongPassword,
  LoginErrorReasons.EmailLoginBan,
  LoginErrorReasons.EmailRegisterBan,
];

export const CAPTCHA_REASONS = [
  LoginErrorReasons.DisplayCaptcha,
  LoginErrorReasons.NoCaptcha,
];
