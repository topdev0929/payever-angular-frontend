import { AbstractControl } from '@angular/forms';
import { z } from 'zod';

const MAX_CHARACTER_LENGTH = 64;
const PREFIX_REGEX = /^[^<>()\[\]\\,$#!;?*/%{}^=~:\s&@"]+$/;
const DOMAIN_REGEX = /^[A-Za-z0-9](?!.*\.-)[A-Za-z0-9-]*([.][A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const validatePrefix = (emailPrefix: string) => {
  if (!PREFIX_REGEX.test(emailPrefix) || emailPrefix.includes('..') || emailPrefix.startsWith('.') || emailPrefix.endsWith('.')) {
    throw new Error('forms.error.validator.invalid_prefix');
  }

  if (emailPrefix.length >= MAX_CHARACTER_LENGTH) {
    throw new Error('forms.error.validator.prefix_invalid_length');
  }
};

const validateDomain = (emailDomain: string) => {
  if (!DOMAIN_REGEX.test(emailDomain)) {
    throw new Error('forms.error.validator.invalid_domain');
  }

  if (emailDomain.length >= MAX_CHARACTER_LENGTH) {
    throw new Error('forms.error.validator.domain_invalid_length');
  }

  if (emailDomain.split('.').some(s => s.length >= MAX_CHARACTER_LENGTH)) {
    throw new Error('forms.error.validator.subdomain_invalid_length');
  }
};


const emailSchema = z.string().refine((val) => {
  const emailParts = /^([^@]+)@(.+)$/.exec(val);

  if (!emailParts) {
    throw new Error('forms.error.validator.invalid_email_format');
  }

  const [, emailPrefix, emailDomain] = emailParts;

  validatePrefix(emailPrefix);
  validateDomain(emailDomain);

  return true;
});


export const PeEmailValidator = (control: AbstractControl): { [key: string]: boolean } => {
  if (!control.value) {
    return null;
  }

  try {
    emailSchema.parse(control.value);

    return null;
  } catch (ex) {
    return { email: true };
  }
};
