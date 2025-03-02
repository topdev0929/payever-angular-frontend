import { Component } from '@angular/core';

@Component({
  selector: 'pe-invoice-icon-shop',
  styles: [':host { display: flex; }'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <g fill="none" fill-rule="evenodd">
        <g>
          <g transform="translate(-570 -1890) translate(570 1890)">
            <rect width="28" height="28" fill="#86868B" rx="7"/>
            <g fill="#FFF" fill-rule="nonzero">
              <path d="M14.561 3.932h-.876C13.335 1.66 11.408 0 9.044 0 6.679 0 4.753 1.748 4.402 3.932h-.875c-.964 0-1.84.786-1.84 1.835v10.398c0 .961.789 1.835 1.84 1.835h10.946c.964 0 1.84-.786 1.84-1.835V5.68c0-.962-.789-1.748-1.752-1.748zM9.044.962c1.751 0 3.24 1.31 3.59 2.97h-7.18c.35-1.748 1.838-2.97 3.59-2.97z" transform="translate(5.09 5.09)"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  `
})
export class PeInvoiceIconShopComponent {}
