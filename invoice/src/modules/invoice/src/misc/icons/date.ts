import { Component } from '@angular/core';

@Component({
  selector: 'pe-invoice-icon-date',
  styles: [':host { display: flex; }'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <g fill="none" fill-rule="evenodd">
        <g>
          <g transform="translate(-570 -1655) translate(570 1655)">
            <rect width="28" height="28" fill="#86868B" rx="7"/>
            <g fill="#FFF">
              <path d="M5.536 0c.394 0 .714.32.714.714V2.5h7.5V.714c0-.394.32-.714.714-.714h1.072c.394 0 .714.32.714.714V2.5h2.321c.79 0 1.429.64 1.429 1.429V18.57c0 .79-.64 1.429-1.429 1.429H1.43C.639 20 0 19.36 0 18.571V3.93C0 3.139.64 2.5 1.429 2.5H3.75V.714C3.75.32 4.07 0 4.464 0h1.072zM5 12.5c-.69 0-1.25.56-1.25 1.25S4.31 15 5 15s1.25-.56 1.25-1.25S5.69 12.5 5 12.5zm5 0c-.69 0-1.25.56-1.25 1.25S9.31 15 10 15s1.25-.56 1.25-1.25-.56-1.25-1.25-1.25zm-5-5c-.69 0-1.25.56-1.25 1.25S4.31 10 5 10s1.25-.56 1.25-1.25S5.69 7.5 5 7.5zm5 0c-.69 0-1.25.56-1.25 1.25S9.31 10 10 10s1.25-.56 1.25-1.25S10.69 7.5 10 7.5zm5 0c-.69 0-1.25.56-1.25 1.25S14.31 10 15 10s1.25-.56 1.25-1.25S15.69 7.5 15 7.5z" transform="translate(4 4)"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  `
})
export class PeInvoiceIconDateComponent {}
