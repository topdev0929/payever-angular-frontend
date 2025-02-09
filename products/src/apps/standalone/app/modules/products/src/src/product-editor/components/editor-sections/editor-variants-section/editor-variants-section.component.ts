import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, tap } from 'rxjs/operators';

import { MediaContainerType, MediaUrlPipe, MediaUrlTypeEnum } from '@pe/media';


import { SectionsService } from '../../../services';
import { AbstractComponent } from '../../../../misc/abstract.component';
import { VariantsSection } from '../../../../shared/interfaces/section.interface';
import { ProductEditorSections } from '../../../../shared/enums/product.enum';
import { EnvService } from '../../../../shared/services/env.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'variants-section',
  templateUrl: 'editor-variants-section.component.html',
  styleUrls: ['editor-variants-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorVariantsSectionComponent extends AbstractComponent implements OnInit {
  currency: string;
  readonly section: ProductEditorSections = ProductEditorSections.Variants;
  variantsSection: VariantsSection[] = this.sectionsService.variantsSection;
  showVariantDetails = true;
  errors: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private envService: EnvService,
    private router: Router,
    private sectionsService: SectionsService,
    private mediaUrlPipe: MediaUrlPipe,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit(): void {
    this.sectionsService.saveClicked$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      if (this.sectionsService.variantsSection.some(variant => !variant.sku || variant.sku === '')) {
        this.sectionsService.onFindError(true, this.section);
      } else {
        this.sectionsService.onFindError(false, this.section);
      }
    });

    this.sectionsService.variantsChange$.pipe(
      tap(() => {
        this.variantsSection = this.sectionsService.variantsSection;

        this.errors = false;

        this.variantsSection.forEach(variant => {
          if (!variant.sku || variant.sku === '') {
            this.errors = true;
          }
        });

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.currency = this.envService.currency;
  }

  getVariant(options) {
    let str = '';

    options.forEach(option => {
      str = str !== '' ? `${str}; ${option.value}` : `${option.value}`;
    });

    return str;
  }

  onCreateNew(): void {
    this.router.navigate([{ outlets: { auxiliary: ['variant' ] } }], {
      skipLocationChange: true,
      relativeTo: this.activatedRoute,
      queryParams: { addExisting: true },
      queryParamsHandling: 'merge',
    });
  }

  onEdit(id: string): void {
    this.sectionsService.resetState$.next(false);
    this.router.navigate([{ outlets: { auxiliary: ['variant', id ] } }], {
      skipLocationChange: true,
      relativeTo: this.activatedRoute,
      queryParams: { addExisting: true },
      queryParamsHandling: 'merge',
    });
  }

  onDelete(id: string): void {
    this.sectionsService.removeVariant(id);
  }

  getImagePath(blob: string): string {
    if (blob) {
      return this.mediaUrlPipe.transform(`${blob}`, MediaContainerType.Products, MediaUrlTypeEnum.Thumbnail);
    }
  }
}
