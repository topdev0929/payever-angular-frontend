import { Component } from '@angular/core';

@Component({
  selector: 'pe-invoice-drafts-date',
  // styles: [':host { display: flex; }'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
      <g fill="none" fill-rule="evenodd">
        <g>
          <g transform="translate(-54 -306) translate(54 306)">
            <rect width="28" height="28" fill="#86868B" rx="7"/>
            <g fill="#FFF" transform="translate(5.09 5.09)">
              <path d="M3.772 13.5l2.592-.694-3.261-3.26-.695 2.59c-.159.595.194 1.206.788 1.365.189.05.387.05.576 0zM15.9.609c.8.777.905 2.25.038 3.094l-8.306 7.752L4.455 8.36 12.76.609c.868-.845 2.342-.778 3.14 0z"/>
              <rect width="17.818" height="2.545" y="15.273" rx="1.114"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  `
})
export class PeInvoiceIconDraftsComponent {}
