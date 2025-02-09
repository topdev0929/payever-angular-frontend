export const MOBILE_PHONE_PATTERN = /^\+[1-9]\d{3,14}$/;
export const DOMAIN_PATTERN = /^[^<>()[\],;:\s@"'`]+\.[a-zA-Z]{2,}$/;
// eslint-disable-next-line max-len
export const EMAIL_ADDRESS_PATTERN = /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)*[^<>()[\].,;:\s@"]{2,}\.\w{2,})$/i;

export const DIGIT_FORBIDDEN_PATTERN = /^[^\s!@#$%^&*()0-9]+(\s+[^\s!@#$%^&*()0-9]+)*$/;
export const CHAR_FORBIDDEN_PATTERN = /^[^\s!@#$%^&*()a-zA-Z]+(\s+[^\s!@#$%^&*()a-zA-Z]+)*$/;
export const SPECIAL_CHAR_FORBIDDEN_PATTERN = /^[^\s!@#$%^&*()]+(\s+[^\s!@#$%^&*()]+)*$/;
