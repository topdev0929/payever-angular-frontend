import { Component } from '@angular/core';

@Component({
  selector: 'pe-invoice-icon-point-of-sale',
  styles: [':host { display: flex; }'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <defs>
        <linearGradient id="fwtxt37w1a" x1="27.342%" x2="73.96%" y1="-7.019%" y2="110.296%">
          <stop offset="0%" stop-color="#FFF"/>
          <stop offset="100%" stop-color="#EEE"/>
        </linearGradient>
      </defs>
      <g fill="none" fill-rule="evenodd">
        <g>
          <g transform="translate(-570 -1832) translate(570 1832)">
            <rect width="28" height="28" fill="#86868B" rx="7"/>
            <g fill-rule="nonzero">
              <g>
                <path fill="url(#fwtxt37w1a)" d="M9.92.057c5.28 0 9.71 4.246 9.86 9.586l.003.277c0 5.28-4.341 9.71-9.59 9.86l-.273.003c-5.28 0-9.71-4.247-9.86-9.586L.057 9.92C.057 4.64 4.303.21 9.643.06L9.92.057zm0 6.933l-.177.005C8.171 7.088 6.99 8.413 6.99 9.92l.005.176c.093 1.573 1.418 2.754 2.925 2.754l.166-.006c1.492-.092 2.764-1.417 2.764-2.924l-.006-.177C12.752 8.171 11.427 6.99 9.92 6.99z" transform="translate(4 4)"/>
                <path fill="#2F2F2F" d="M9.92 12.85c-1.563 0-2.93-1.27-2.93-2.93 0-1.563 1.27-2.93 2.93-2.93 1.562 0 2.93 1.27 2.93 2.93 0 1.562-1.368 2.93-2.93 2.93z" opacity=".518" transform="translate(4 4)"/>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>

  `
})
export class PeInvoiceIconPointOfSaleComponent {}
