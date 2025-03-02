import {Component, Input} from '@angular/core';

@Component({
  selector: 'pe-connect-tree-filter-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18">
      <g fill="none" fill-rule="evenodd" [attr.opacity]="active ? 1 : 0.5">
        <g>
          <g>
            <path stroke="#FFF" stroke-width="1.215" d="M14.46 15.966H1.506C.674 15.966 0 15.292 0 14.46V1.506C0 .675.674 0 1.506 0H14.46c.832 0 1.506.675 1.506 1.506V14.46c0 .832-.674 1.506-1.506 1.506z" transform="translate(-23 -59) translate(24 60)"/>
            <path fill="#FFF" d="M5.62 5.435H1.84c-.336 0-.608-.272-.608-.608 0-.335.272-.608.608-.608h3.78c.336 0 .608.273.608.608 0 .336-.272.608-.608.608zm0 3.156H1.84c-.336 0-.608-.272-.608-.608 0-.335.272-.607.608-.607h3.78c.336 0 .608.272.608.607 0 .336-.272.608-.608.608zm0 3.156H1.84c-.336 0-.608-.272-.608-.608 0-.335.272-.607.608-.607h3.78c.336 0 .608.272.608.607 0 .336-.272.608-.608.608zM1.03 0C.46 0 0 .461 0 1.03v13.907c0 .568.461 1.03 1.03 1.03h6.43V0H1.03z" transform="translate(-23 -59) translate(24 60)"/>
          </g>
        </g>
      </g>
    </svg>
  `,
  styles: [':host {height: 16px; cursor: pointer}']
})
export class PeConnectTreeFilterIconComponent {
  @Input() active: boolean;
}

