import { Component } from '@angular/core';

@Component({
  selector: 'pe-invoice-icon-time',
  styles: [':host { display: flex; }'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <g fill="none" fill-rule="evenodd">
        <g>
          <g transform="translate(-570 -1819) translate(570 1819)">
            <rect width="28" height="28" fill="#86868B" rx="7"/>
            <g fill="#FFF" fill-rule="nonzero">
              <path d="M8.91 0C4.01 0 0 4.01 0 8.91s4.01 8.908 8.91 8.908 8.908-4.009 8.908-8.909S13.81 0 8.91 0zm4.354 12.835l-4.621-2.737c-.34-.196-.544-.545-.544-.927V4.057c.012-.447.397-.817.861-.817.464 0 .85.37.85.817V8.91l4.349 2.518c.408.24.544.753.294 1.145-.249.382-.781.502-1.189.262z" transform="translate(5.09 5.09)"/>
            </g>
          </g>
        </g>
      </g>
    </svg>
  `
})
export class PeInvoiceIconTimeComponent {}
