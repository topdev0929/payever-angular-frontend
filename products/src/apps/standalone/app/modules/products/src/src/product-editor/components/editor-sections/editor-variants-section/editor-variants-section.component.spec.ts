import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { I18nModule } from '@pe/i18n';
import { MediaContainerType, MediaUrlPipe, MediaUrlTypeEnum } from '@pe/media';
// import { DeviceType, WindowService } from '@pe/ng-kit/modules/window';

import { CurrencyService } from '../../../../../shared/services/currency.service';
import { SectionsService } from '../../../services';
import { EditorVariantsSectionComponent } from './editor-variants-section.component';


@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('EditorVariantsSectionComponent', () => {
  let component: EditorVariantsSectionComponent;
  let fixture: ComponentFixture<EditorVariantsSectionComponent>;

  let currencyServiceMock: CurrencyService;
  let activatedRouteMock: ActivatedRoute;
  let sectionsServiceMock: SectionsService;
  let routerSpy: jasmine.SpyObj<Router>;
  let mediaUrlPipeSpy: jasmine.SpyObj<MediaUrlPipe>;
  let windowServiceMock: WindowService;

  beforeEach(() => {
    currencyServiceMock = { currency: 'usd' };
    activatedRouteMock = {} as any;
    sectionsServiceMock = {
      removeVariant: () => true,
      resetState$: new BehaviorSubject<boolean>(true),
      variantsSection: [],
    } as any;
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    mediaUrlPipeSpy = jasmine.createSpyObj<MediaUrlPipe>('MediaUrlPipe', ['transform']);
    windowServiceMock = {
      deviceType$: new Subject<DeviceType>(),
    } as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [I18nModule],
      declarations: [EditorVariantsSectionComponent, TranslatePipe],
      providers: [
        { provide: CurrencyService, useFactory: () => currencyServiceMock } ,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useFactory: () => activatedRouteMock },
        { provide: SectionsService, useFactory: () => sectionsServiceMock },
        { provide: MediaUrlPipe, useValue: mediaUrlPipeSpy },
        { provide: WindowService, useFactory: () => windowServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditorVariantsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should have currency instantiated after initialization', () => {
    expect(component.currency).toBe(currencyServiceMock.currency);
  });

  it('#onCreateNew should user router to navigate', () => {
    const expectedRoute: string[] = ['variant'];
    const expectedRouteArgs: any = {
      relativeTo: activatedRouteMock,
      queryParams: { addExisting: true }, queryParamsHandling: 'merge',
    };

    component.onCreateNew();
    expect(routerSpy.navigate).toHaveBeenCalledWith(expectedRoute, expectedRouteArgs);
  });

  it('#onEdit should user router to navigate', () => {
    const editId = 'id';
    const expectedRoute: string[] = ['variant', editId];
    const expectedRouteArgs: any = {
      relativeTo: activatedRouteMock,
      queryParams: { addExisting: true }, queryParamsHandling: 'merge',
    };
    const sectionsService = TestBed.get(SectionsService);

    component.onEdit(editId);
    expect(routerSpy.navigate).toHaveBeenCalledWith(expectedRoute, expectedRouteArgs);
    expect(sectionsService.resetState$.value).toBe(false);
  });

  it('#onDelete should call sectionsApi to remove variant', () => {
    const deleteId = 'id';

    const removeVariantSpy: jasmine.Spy = spyOn(sectionsServiceMock, 'removeVariant');

    component.onDelete(deleteId);
    expect(removeVariantSpy).toHaveBeenCalledWith(deleteId);
    expect(component.variantsSection).toEqual(sectionsServiceMock.variantsSection);
  });

  it('#getImagePath should use media pipe to transform url', () => {
    const blob = 'id';
    component.getImagePath(blob);

    expect(mediaUrlPipeSpy.transform).toHaveBeenCalledWith(blob, MediaContainerType.Products, MediaUrlTypeEnum.Thumbnail);
  });

  it('#getImagePath should not use media pipe when blob is not provided', () => {
    const blob: string = null;
    component.getImagePath(blob);

    expect(mediaUrlPipeSpy.transform).not.toHaveBeenCalled();
  });
});
