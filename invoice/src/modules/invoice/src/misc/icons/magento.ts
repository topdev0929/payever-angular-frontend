import { Component } from '@angular/core';

@Component({
  selector: 'pe-invoice-icon-magento',
  styles: [':host { display: flex; }'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <g fill="none" fill-rule="evenodd">
        <g>
          <g transform="translate(-570 -1946) translate(570 1946)">
            <rect width="28" height="28" fill="#86868B" rx="7"/>
            <g fill="#F9F9F9">
              <path d="M8.995.265L1.588 4.744v8.511l1.924 1.131V5.874l5.485-3.329 5.49 3.324.022.013-.002 8.492 1.905-1.119V4.744L8.995.264zm.98 15.191l-.98.599-.98-.602v-9.94l-2.542 1.56v8.511l3.522 2.151 3.552-2.166v-8.5L9.976 5.504v9.951z" transform="translate(5.09 5.09)"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  `
})
export class PeInvoiceIconMagentoComponent {}
