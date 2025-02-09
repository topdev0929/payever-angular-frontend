import { Component } from '@angular/core';

@Component({
  selector: 'peb-mail-big-campaign-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="90"
      height="90"
      viewBox="0 0 90 90"
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
      <g fill="none" opacity=".1">
        <path
          fill="#D2D2D2"
          d="M50.966 61.837l-10.23 6.865c-.896.604-2.052.664-3.004.154-.953-.51-1.545-1.505-1.538-2.585V54.92c-.01-.274.125-.533.355-.68.23-.149.522-.164.767-.041l13.543 6.25c.275.109.465.366.488.661.022.296-.126.578-.381.728z"
        />
        <path
          fill="url(#prefix__a)"
          d="M36.648 55.774L2.538 35.419C.803 34.391-.173 32.446.04 30.441c.212-2.005 1.574-3.702 3.486-4.344L79.386.214C81.1-.33 82.964.35 83.925 1.869c.96 1.52.775 3.495-.45 4.809L36.647 55.774z"
        />
        <path
          fill="url(#prefix__b)"
          d="M36.541 56.094S53.29 75.781 62.478 86.385c1.329 1.511 3.415 2.111 5.343 1.538 1.928-.574 3.346-2.218 3.632-4.21L84.542 4.969c.45-1.753-.34-3.588-1.923-4.467-1.582-.88-3.557-.58-4.808.728L36.728 50.298c-1.564 1.588-1.645 4.11-.187 5.796z"
        />
      </g>
    </svg>
  `,
})
export class PebMailIconBigCampaignComponent {}
