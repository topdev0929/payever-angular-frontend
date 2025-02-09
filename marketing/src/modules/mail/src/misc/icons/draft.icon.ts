import { Component } from '@angular/core';

@Component({
  selector: 'peb-mail-draft-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
    >
      <g fill="none" fill-rule="evenodd">
        <rect width="22" height="22" fill="#86868B" rx="5.5" />
        <path
          fill="#FFF"
          fill-rule="nonzero"
          d="M11 4c-3.85 0-7 3.15-7 7s3.15 7 7 7 7-3.15 7-7-3.15-7-7-7zm3.422 10.085l-3.631-2.15c-.267-.155-.427-.43-.427-.729V7.188c.009-.351.311-.643.676-.643.365 0 .667.292.667.643V11l3.418 1.98c.32.188.427.59.231.899-.196.3-.614.394-.934.206z"
        />
      </g>
    </svg>
  `,
})
export class PebMailIconDraftComponent {}
