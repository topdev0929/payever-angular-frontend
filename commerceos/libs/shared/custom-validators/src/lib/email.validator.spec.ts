import { FormControl } from '@angular/forms';
import { test } from '@jest/globals';

import { PeEmailValidator } from './email.validator';
/*
The email address must start with one or more alphanumeric characters, periods, underscores, percent signs, plus signs, or hyphens.
The "@" symbol must be present after the first set of characters.
The domain name must contain one or more sets of alphanumeric characters or hyphens, separated by periods.
The top-level domain name must contain two or more alphabetic characters.
The email address must not contain any spaces, commas, or other special characters.
The email prefix should be up to 64 characters long
The email domain should be up to 255 characters long
*/

const STRING_64 = '1234567890123456789012345678901234567890123456789012345678901234';

const invalidEmails = [
  ' ',
  '@correct.com',
  'a.-bc',
  'a..bc@correct.com',
  'abc@correct..com',
  '.abc@correct.com',
  'rob@rob',
  'abcd.@correct.com',
  'abcd..f@correct.com',
  `${STRING_64}+x@correct.com`,
  'a"b(c)d,e:f;g<h>i[j\\k]l@correct.com',
  'correct-prefix@invalid-domain',
  'correct-prefix@-invalid.domain',
  'john.doe@.net',
  'john.doe43@domain-sample',
  'i_like_underscore@but_its_not_allowed_in_this_part.example.com',
  'A@b@c@example.com',
  'A@b@@example.com@@',
  'goodname@correct.com@additional-domain.com',
  'correct-prefix@domain.c',
  'correct-prefix@-domain.c',
  'correct-prefix@domain.c-',
  'correct-prefix@just-numbers.9999',
  `long-domain@${STRING_64}dom.com`,
  `long-domain@${STRING_64}${STRING_64}${STRING_64}${STRING_64}.com`,
  'correct@correct.123invalid',
  'correct@correct',
  'mail@gmail.c',
  'mail$@gmail.com',
  'mail#@gmail.com',
  'mail!@gmail.com',
  'mail&@gmail.com',
  'mail@gma!l.com',
  'mail@gm{a}l.com',
  'mail@gma l.com',
  'm il@gmail.com',
  'm,il@gmail.com',
  'mail@gmail.22',
  `printable'a*a+a-a/a=a?a^a_a{a|a}a~a.test@correct.com`,
];

const validEmails = [
  'ma--il2@mail2.com',
  'ma__il2@mail2.com',
  'mail2@mail2.com',
  'a@correct.com',
  'ab@correct.com',
  'abcdef@correct.com',
  '12345678901234567890123456789012345678901234567890123456789@correct.com',
  'a-b.c-d@correct.com',
  'a-b.c-d@correct.sub.domain.co',
  'correct-prefix@10-start-with-numbers.ab',
  'correct-prefix@multi.sub.domain',
  'erfan@test.te-st.com',
  'test@123abc.com',
];

describe('PeEmailValidator', () => {
  const cases: [string[], { [key: string]: boolean }][] = [
    [validEmails, null],
    [invalidEmails, { email: true }],
  ];

  cases.forEach(([emails, expected])=>{
    const validity = expected ? 'invalid' : 'valid';
    test.each(emails)(`email: %s should mark as ${validity}`,(email)=>{
      const control = new FormControl(email);
      expect(PeEmailValidator(control)).toEqual(expected);
    });
  });
});
