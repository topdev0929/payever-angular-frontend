import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { forEach } from 'lodash';
import { IconSprite, IconSvg, IconPngSet } from './icons-doc.interface';

@Component({
  selector: 'doc-icons',
  templateUrl: './icons-doc.component.html',
  styleUrls: ['./icons-doc.component.scss']
})
export class IconsDocComponent implements AfterViewInit {

  @ViewChild('spritesContainer', { static: true }) spritesContainer: ElementRef<HTMLInputElement>;
  private svgSpritesList: IconSprite[] = [];
  private pngIconsSetList: IconPngSet[] = [
    {
      name: 'Payments Options Round',
      prefix: 'p-round-',
      icons: [
        'cash',
        'direct-debit',
        'payex',
        'paylater',
        'paymill',
        'paypal',
        'santander',
        'sofort',
        'twilio',
        'visa'
      ],
      sizes: [
        {size: 32},
        {size: 64},
        {size: 128}
      ]
    },
    {
      name: 'Icon Set',
      prefix: 'set-',
      icons: [
        'store-red'
      ],
      sizes: [
        {size: 32},
        {size: 64},
        {size: 128}
      ]
    },
    {
      name: 'White icons',
      prefix: 'white-',
      classes: 'dark-background',
      icons: [
        'check-rounded'
      ],
      sizes: [
        {size: 16},
        {size: 24},
        {size: 32},
        {size: 64},
        {size: 128}
      ]
    },
    {
      name: 'Payments Options Square',
      prefix: 'p-square-',
      classes: 'icon-p-square',
      icons: [
        'cash',
        'direct-debit',
        'payex',
        'paylater',
        'paymill',
        'paypal',
        'santander',
        'santander-consumer',
        'sofort',
        'twilio',
        'visa'
      ],
      sizes: [
        {size: 16},
        {size: 32},
        {size: 64},
        {size: 128}
      ]
    },
    {
      name: 'Offers Icons',
      prefix: 'offers-',
      icons: [
        'logo'
      ],
      sizes: [
        {size: 16},
        {size: 32},
        {size: 64},
        {size: 128}
      ]
    },
    {
      name: 'Dahboard Icons',
      prefix: 'db-',
      icons: [
        'ad',
        'apps',
        'app-market',
        'banners',
        'cart',
        'checkout',
        'commerce-os',
        'contacts',
        'coupon',
        'legal',
        'marketing',
        'orders',
        'pages',
        'payments',
        'pos',
        'products',
        'security',
        'settings',
        'shipping',
        'statistics',
        'store',
        'support',
        'themes',
        'trust',
        'ad-colored',
        'app-market-colored',
        'banners-colored',
        'cart-colored',
        'checkout-colored',
        'commerce-os-colored',
        'contacts-colored',
        'coupon-colored',
        'legal-colored',
        'marketing-colored',
        'orders-colored',
        'pages-colored',
        'payments-colored',
        'pos-colored',
        'products-colored',
        'security-colored',
        'settings-colored',
        'shipping-colored',
        'statistics-colored',
        'store-colored',
        'support-colored',
        'themes-colored',
        'trust-colored',
      ],
      sizes: [
        {size: 16},
        {size: 32},
        {size: 64},
        {size: 128}
      ]
    },
    {
      name: 'Payment Icons',
      prefix: 'payment-',
      icons: [
        'bag',
        'finger-up',
        'leaf'
      ],
      sizes: [
        {size: 16},
        {size: 20},
        {size: 24},
        {size: 32},
        {size: 48},
        {size: 64},
        {size: 96},
        {size: 128}
      ]
    },
    {
      name: 'Shipping Icons',
      prefix: 'shipping-',
      icons: [
        'green',
        'yellow'
      ],
      sizes: [
        {size: 16},
        {size: 24},
        {size: 32},
        {size: 48},
        {size: 64},
        {size: 128}
      ]
    }
  ];

  iconsDashboardPng: string[] = [
    'icon-db-ad',
    'icon-db-contacts',
    'icon-db-checkout',
    'icon-db-facebook',
    'icon-db-mail',
    'icon-db-market',
    'icon-db-orders',
    'icon-db-payments',
    'icon-db-pos',
    'icon-db-products',
    'icon-db-santander',
    'icon-db-settings',
    'icon-db-shipping',
    'icon-db-shop',
    'icon-db-shopify',
    'icon-db-statistics',
    'icon-db-store',
    'icon-db-support',
    'icon-db-trust',
    'icon-db-trust-2',
    'icon-db-weebly',
    'icon-db-twilio',
    'icon-db-terminal',
    'icon-db-themes'
  ];

  iconsPng: string[] = [
    'ad',
    'contacts',
    'mail',
    'market',
    'orders',
    'payments',
    'pos',
    'products',
    'settings',
    'shipping',
    'shop',
    'statistics',
    'store',
    'store-red',
    'support',
    'trust'
  ];

  commerceOsIcons: string[] = [
      'ad',
      'applications',
      'checkout',
      'connect',
      'coupons',
      'customers',
      'marketing',
      'messenger',
      'pos',
      'products',
      'settings',
      'shipping',
      'statistics',
      'store',
      'transactions',
  ];

  iconsPngImg32: string[] = [];
  iconsPngImg64: string[] = [];
  iconsPngImg128: string[] = [];

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.setUpSvgSpriteSet();

    this.iconsPngImg32 = this.getDataUrls('32');
    this.iconsPngImg64 = this.getDataUrls('64');
    this.iconsPngImg128 = this.getDataUrls('128');

    this.setUpPngSet();
    this.changeDetectorRef.detectChanges();
  }

  iconStyle(iconId: string): { width: string; height: string } {
    const iconElement: HTMLElement = document.getElementById(iconId.replace('#', ''));
    const viewBox: string = iconElement.getAttribute('viewBox') || iconElement.getAttribute('viewbox');
    const size: string[] = viewBox.split(' ');
    return {
      width: `${size[2]}px`,
      height: `${size[3]}px`
    };
  }

  private setUpSvgSpriteSet(): void {
    if (this.spritesContainer) {
      forEach(this.spritesContainer.nativeElement.children, (val) => {
        if (val.children[0] && val.children[0].children.length !== 0) {
          const icons: IconSvg[] = [];
          const spriteTitle: string = val.children[0].getAttribute('data-id');

          forEach(val.children[0].children, (icon) => {
            const id: string = icon.getAttribute('id');
            const size: string = id.substr(id.length - 3).replace(/\D/g, '');
            const svgRaw: any = icon.innerHTML.replace(/(\r\n|\n|\r)/gm, '').replace(/currentColor/g, '#000000');

            icons.push({id: '#' + id, size: size, raw: svgRaw});
            // icons.push({ id: '#' + id, size: size });
          });
          this.svgSpritesList.push({title: spriteTitle, icons: icons});
        }
      });
    }
  }

  private setUpPngSet(): void {
    for (const set of this.pngIconsSetList) {
      if (set.sizes.length !== 0) {
        for (const item of set.sizes) {
          item.icons = set.icons.map((name: any) => {
            return {'name': name, 'src': require(`../../../../../../icons-png/icon-${set.prefix + name}-${item.size}.png`)};
          });
        }
      }
    }
  }

  private getDataUrls(size: string): string[] {
    return this.iconsPng.map((item: string) => {
      return require(`../../../../../../icons-db/icon-${item}-colored-${size}.png`);
    });
  }

  private getCommerceColoredUrls(name: string): string {
    return require(`../../../../../../icons-png/icon-commerceos-${name}-32.png`);
  }

    private getCommerceColoredRetinaUrls(name: string): string {
        return require(`../../../../../../icons-png/icon-commerceos-${name}-64.png`);
    }


    private getCommerceWhiteUrls(name: string): string {
    return require(`../../../../../../icons-png/icon-commerceos-${name}-32-white.png`);
  }

}
