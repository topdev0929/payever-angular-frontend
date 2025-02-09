import { Component } from '@angular/core';

@Component({
  selector: 'peb-mail-campaign-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
    >
      <defs>
        <linearGradient
          id="prefix__a"
          x1="36.298%"
          x2="67.128%"
          y1="21.956%"
          y2="66.948%"
        >
          <stop offset="0%" stop-color="#FFF" />
          <stop offset="100%" stop-color="#CBCBCB" />
        </linearGradient>
        <linearGradient
          id="prefix__b"
          x1="52.294%"
          x2="45.649%"
          y1="-13.668%"
          y2="120.379%"
        >
          <stop offset="0%" stop-color="#FFF" />
          <stop offset="100%" stop-color="#E1E1E1" />
        </linearGradient>
      </defs>
      <g fill="none" fill-rule="evenodd">
        <rect width="22" height="22" fill="#86868B" rx="5.5" />
        <g fill-rule="nonzero">
          <path
            fill="#D2D2D2"
            d="M7.928 9.62l-1.591 1.067c-.14.094-.32.103-.468.024-.148-.08-.24-.234-.239-.402V8.543c-.001-.043.02-.083.055-.106.036-.023.082-.025.12-.006l2.106.972c.043.017.073.057.076.103.004.046-.02.09-.059.113z"
            transform="translate(4 4)"
          />
          <path
            fill="url(#prefix__a)"
            d="M5.7 8.676L.396 5.51c-.27-.16-.422-.463-.389-.775.033-.312.245-.576.542-.675L12.35.033c.266-.084.556.022.706.258.15.236.12.543-.07.748L5.7 8.676z"
            transform="translate(4 4)"
          />
          <path
            fill="url(#prefix__b)"
            d="M5.684 8.726s2.605 3.062 4.035 4.712c.206.235.53.328.83.239.3-.09.521-.345.566-.655L13.151.772c.07-.272-.053-.557-.3-.694-.245-.137-.553-.09-.747.113l-6.39 7.633c-.244.247-.257.64-.03.902z"
            transform="translate(4 4)"
          />
        </g>
      </g>
    </svg>
  `,
})
export class PebMailIconCampaignComponent {}
