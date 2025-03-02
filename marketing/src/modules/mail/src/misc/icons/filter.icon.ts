import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-mail-filter-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="10"
      viewBox="0 0 14 10"
    >
      <g
        fill="none"
        fill-rule="evenodd"
        [attr.stroke]="!active ? '#78787D' : '#ffffff'"
        stroke-linecap="round"
        stroke-width="2"
      >
        <path d="M0 .5L14 .5M3 5L11 5M6 9.5L8 9.5" />
      </g>
    </svg>
  `,
})
export class PebMailIconFilterComponent {
  @Input() active = false
}
