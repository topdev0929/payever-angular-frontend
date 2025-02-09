import { Component } from '@angular/core';
import { BadgeItem } from '../../../../../modules/badge';
import { LayoutService } from '../../../../../modules/layout';

@Component({
  selector: 'doc-layout-app',
  templateUrl: 'layout-app-doc.component.html'
})
export class LayoutAppDocComponent {
  backgroundImage: string = require('../../../assets/img/background_jpg_ed4f73.jpg');
  backgroundImageUrl: string = require('../../../assets/img/central-park.jpg');

  badgeSet: BadgeItem[] = [
    { id: 1, title: 'Smart keyboard for 12.9-inch iPad' },
    { id: 2, title: 'UE Megaboon Partable' },
    { id: 3, title: 'Wireless Mouse' }
  ];
  isCustomBackButton: boolean = false;
  isFooterOpened: boolean = false;
  isLayoutHeaderTransparent: boolean = false;
  isLayoutBodyTransparent: boolean = true;
  isLayoutSidebarTransparent: boolean = true;
  isShowBackButton: boolean = true;
  isSidebarOpened: boolean;

  constructor(private layoutService: LayoutService) {
    this.layoutService.sidebarToggleEvent.subscribe((state: boolean) => { this.isSidebarOpened = state; });
    this.layoutService.layoutClosedEvent.subscribe(() => {
      this.layoutService.toggleSidebar();
      
    });
  }

  handleSidebarToggle() {
    this.layoutService.toggleSidebar();
  }

  handleLayoutClose() {
    this.layoutService.closeLayout();
  }

  toggleHeaderTransparent(e: Event) {
    this.isLayoutHeaderTransparent = (<HTMLInputElement>e.target).checked;
  }

  toggleBodyTransparent(e: Event) {
    this.isLayoutBodyTransparent = (<HTMLInputElement>e.target).checked;
  }

  toggleSidebarTransparent(e: Event) {
    this.isLayoutSidebarTransparent = (<HTMLInputElement>e.target).checked;
  }

  ts1: string = `
import { LayoutModule } from '@pe/ng-kit/modules/layout';
import { BadgeModule } from '@pe/ng-kit/modules/badge';
import { BadgeItem } from '@pe/ng-kit/modules/badge';

badgeSet: BadgeItem[] = [
  { id: 1, title: 'Smart keyboard for 12.9-inch iPad' },
  { id: 2, title: 'UE Megaboon Partable' },
  { id: 3, title: 'Wireless Mouse' }
];
  `;

  html1: string = `

<pe-layout-app
  [backgroundImageUrl]="backgroundImageUrl"
  [fullView]="false"
  [backgroundImageUrl]="backgroundImage"
  [headerTransparent]="layoutHeaderTransparent"
  [withClose]="false" // depricated
  >

  <div class="row" toolbar>
    <div class="col-xs-6">
      <a href="" (click)="handleLayoutClose()">
        <svg class="icon icon-16" ><use xlink:href="#icon-trashcan-16"></use></svg>
      </a>
    </div>
    <div class="col-xs-6 text-right">
      <svg (click)="handleSidebarToggle()" class="icon icon-16 visible-xs-inline-block"><use xlink:href="#icon-shopping-cart-16"></use></svg>
    </div>
  </div>

  <pe-layout-header header [showBackButton]="showBackButton">
    <div *ngIf="customBackButton" col-left>
      <a>
        <svg class="icon icon-24"><use xlink:href="#icon-dashboard-24"></use></svg>
      </a>
    </div>
    <div col-center>
      <div class="modal-title">
        <svg class="icon icon-24"><use xlink:href="#icon-checkbox-checked-24"></use></svg>
      </div>
    </div>
    <div col-right>
      right area
    </div>
  </pe-layout-header>
  <pe-layout-content
  [bodyTransparent]="layoutBodyTransparent"
  [sidebarTransparent]="layoutSidebarTransparent">
    here goes main content
    <pe-layout-sidebar sidebar [class.with-footer]="true">
      <div class="sidebar-footer" [class.opened]="openedFooter">
        <div class="caption-2">Select payment</div>
        <button class="btn btn-default btn-link btn-sm btn-close" (click)="openedFooter = false">
          <svg class="icon icon-16"><use xlink:href="#icon-trashcan-16"></use></svg>
        </button>
        <div class="btn-p-block">
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_payex.png" [srcset]="srcsetPayex" width="38" height="12">
              </button>
            </div>
            <div class="btn-p-title small">PayEx</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_credit_card.png" [srcset]="srcsetCreditCard" width="28" height="24">
              </button>
            </div>
            <div class="btn-p-title small">Card</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_santander.png" [srcset]="srcsetSantander" width="22" height="20">
              </button>
            </div>
            <div class="btn-p-title small">Santander</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_sofort.png" [srcset]="srcsetSofort" width="12" height="20">
              </button>
            </div>
            <div class="btn-p-title small">Klarna</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_paypal.png" [srcset]="srcsetPaypal" width="17" height="20">
              </button>
            </div>
            <div class="btn-p-title small">Paypal</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_direct_debit.png" [srcset]="srcsetDirectDebit" width="21" height="20">
              </button>
            </div>
            <div class="btn-p-title small">Direct debit</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn">
              <button class="btn btn-default btn-rounded">
                <img src="../../../assets/icons-payment/payment_paymill.png" [srcset]="srcsetPaymill" width="19" height="20">
              </button>
            </div>
            <div class="btn-p-title small">Paymill</div>
          </div>
          <div class="btn-p-item text-center">
            <div class="btn-p-btn btn-p-more">
              <button class="btn btn-default btn-rounded" (click)="openedFooter = true">
                <svg class="icon icon-24"><use xlink:href="#icon-dots-h-24"></use></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="wrapper scrollbar-dark">
        <button class="btn btn-link btn-inline">
          <svg class="icon icon-16"><use xlink:href="#icon-arrow-left-small-16"></use></svg>
          <span>Back link</span>
        </button>
        <h4 class="text-center">Edit Ad</h4>
        <form class="form-table">
          <fieldset>
            <div class="clearfix">
              <div class="row">
                <div class="col-xs-12">
                  <textarea class="form-control" id="ft11" placeholder="Textarea field" rows="3" tabindex="13"></textarea>
                  <label for="ft11">Textarea field</label>
                </div>
                <div class="col-xs-12">
                  <input class="form-control" id="exampleInputFirst" placeholder="Title" type="email">
                  <label>Title</label>
                </div>
                <div class="col-xs-12">
                  <textarea class="form-control" id="ft11" placeholder="Textarea field" rows="3" tabindex="13"></textarea>
                  <label for="ft11">Textarea field</label>
                </div>
              </div>

            </div>
          </fieldset>
        </form>
        <h4 class="text-center">Collapsable</h4>
        <accordion [closeOthers]="true" class="ui-accordion ui-sidebar-accordion">
          <accordion-group heading="This is a Heading">
            This content is straight in the template.
          </accordion-group>
          <accordion-group heading="This is a Heading">
            <form class="form-table">
              <p class="caption-2">Location</p>
              <fieldset>
                <div class="clearfix">
                  <div class="row">
                    <div class="col-xs-12">
                      <input class="form-control" id="exampleInputFirst" placeholder="Country, City or ZIP code" type="email">
                      <label>Country, City or ZIP code</label>
                    </div>
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <div class="clearfix">
                  <div class="col-xs-6">
                    <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                      <option value="">Select field</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                    </select>
                    <label for="ft06">Select field</label>
                  </div>
                  <div class="col-xs-6">
                    <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                      <option value="">Select field</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                    </select>
                    <label for="ft06">Select field</label>
                  </div>
                </div>
              </fieldset>
            </form>
          </accordion-group>
          <accordion-group heading="This is a Heading">
            This content is straight in the template.
          </accordion-group>
        </accordion>
        <h4 class="text-center">Badge Set</h4>
        <pe-badge-set [badgeSet]="badgeSet" (removeItemEvent)="onBadgeRemove($event)"></pe-badge-set>
        <h4 class="text-center">Audience</h4>
        <form class="form-table">
          <p class="caption-2">Location</p>
          <fieldset>
            <div class="clearfix">
              <div class="row">
                <div class="col-xs-12">
                  <input class="form-control" id="exampleInputFirst" placeholder="Country, City or ZIP code" type="email">
                  <label>Country, City or ZIP code</label>
                </div>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <div class="clearfix">
              <div class="col-xs-6">
                <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                  <option value="">Select field</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
                <label for="ft06">Select field</label>
              </div>
              <div class="col-xs-6">
                <select class="form-control" id="ft06" placeholder="Select field" tabindex="8">
                  <option value="">Select field</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4</option>
                </select>
                <label for="ft06">Select field</label>
              </div>
            </div>
          </fieldset>
        </form>
        <h4 class="text-center">Customers</h4>
        <ul class="nav nav-sidebar-blocks">
          <li>
            <a class="row" href="#">
              <span class="col-xs-10">Edit Ad</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
            </a>
          </li>
        </ul>
        <ul class="nav nav-sidebar-blocks">
          <li class="title caption-2">Content</li>
          <li>
            <a class="row" href="#">
              <span class="col-xs-6">Price</span>
              <span class="col-xs-4 text-right text-secondary">$699</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
            </a>
          </li>
          <li>
            <a class="row" href="#">
              <span class="col-xs-10">Audience</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-plus-16"></use></svg></span>
            </a>
            <dl class="dl-horizontal">
              <dt>Gender</dt>
              <dd>Woman</dd>
              <dt>Age</dt>
              <dd>24 to 65+</dd>
              <dt>Interests</dt>
              <dd>Furniture Home & Deco Gadgets</dd>
            </dl>
          </li>
          <li>
            <a class="row" href="#">
              <span class="col-xs-6">Inventory SKU</span>
              <span class="col-xs-4 text-right text-secondary">3</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
            </a>
          </li>
          <li>
            <a class="row" href="#">
              <span class="col-xs-6">Selling channels</span>
              <span class="col-xs-4 text-right text-secondary">3</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
            </a>
          </li>
        </ul>
        <p class="small">Create your first Ad to skyrocket your product sales on your Shop.</p>
        <ul class="nav nav-sidebar-blocks">
          <li class="title caption-2">Products & Contents</li>
          <li>
            <a class="row" href="#">
              <span class="col-xs-1"><svg class="icon icon-24"><use xlink:href="#icon-dots-v-24"></use></svg></span>
              <span class="col-xs-9">Dock for Apple Watch</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
            </a>
          </li>
          <li>
            <a class="row" href="#">
              <span class="col-xs-1"><svg class="icon icon-24"><use xlink:href="#icon-dots-v-24"></use></svg></span>
              <span class="col-xs-9">Dock Collection</span>
              <span class="col-xs-2 text-center"><svg class="icon icon-16"><use xlink:href="#icon-arrow-right-2-16"></use></svg></span>
            </a>
          </li>
        </ul>
        <p>
          <button type="button" class="btn btn-link">+ Add products</button>
        </p>
      </div>
    </pe-layout-sidebar>
  </pe-layout-content>
</pe-layout-app>
`;

  html2: string = `
    <div class="row" toolbar>
      <div class="col-xs-6">
        <a href="" (click)="handleLayoutClose()">
          <svg class="icon icon-16" ><use xlink:href="#icon-trashcan-16"></use></svg>
        </a>
      </div>
      <div class="col-xs-6 text-right">
        <svg (click)="handleSidebarToggle()" class="icon icon-16 visible-xs-inline-block"><use xlink:href="#icon-shopping-cart-16"></use></svg>
      </div>
    </div>
  `;

  static onBadgeRemove(badge: BadgeItem): void {
      
  }

}
