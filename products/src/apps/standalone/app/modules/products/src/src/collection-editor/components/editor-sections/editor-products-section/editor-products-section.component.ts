import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { MediaContainerType, MediaUrlPipe, MediaUrlTypeEnum } from '@pe/media';

import { CollectionEditorSections } from '../../../enums';
import { ProductsSection } from '../../../interfaces';
import { CollectionSectionsService } from '../../../services';
import { AbstractComponent } from '../../../../misc/abstract.component';
import { EnvService } from '../../../../shared/services/env.service';

@Component({
  selector: 'products-section',
  templateUrl: 'editor-products-section.component.html',
  styleUrls: ['editor-products-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorProductsSectionComponent extends AbstractComponent implements OnInit {
  currency: string;
  readonly section: CollectionEditorSections = CollectionEditorSections.Products;
  productsSection: ProductsSection = this.sectionsService.productsSection;
  constructor(
    private envService: EnvService,
    private cdr: ChangeDetectorRef,
    private mediaUrlPipe: MediaUrlPipe,
    private sectionsService: CollectionSectionsService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.currency = this.envService.currency;

    this.sectionsService.productsChange$.pipe(takeUntil(this.destroyed$)).subscribe(products => {
      this.productsSection.products = products.filter(p => !!p);
      this.cdr.detectChanges();
    });
  }

  onDeleteProduct(productId: string): void {
    this.sectionsService.setProducts(this.productsSection.products.filter(product => product.id !== productId));
  }

  getImagePath(blob: string): string {
    if (blob) {
      return this.mediaUrlPipe.transform(`${blob}`, MediaContainerType.Products, MediaUrlTypeEnum.Thumbnail);
    }
  }
}
