import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { IconsHelperService } from './icons-helper.service';

describe('icons-helper-service', () => {
  let service: IconsHelperService;
  let httpTestingController: HttpTestingController;
  let matIconRegistry: MatIconRegistry;
  let env: EnvironmentConfigInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        IconsHelperService,
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(IconsHelperService);
    matIconRegistry = TestBed.inject(MatIconRegistry);
    env = TestBed.inject(PE_ENV);
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('service', () => {
    it('registerIcons', () => {
      const domSanitizer = TestBed.inject(DomSanitizer);
      const addSvgIcon = jest.spyOn(matIconRegistry, 'addSvgIcon');
      const icons = [
        'test-icon',
        'widgets-icon',
      ];

      service.registerIcons(icons);
      icons.forEach((name) => {
        expect(addSvgIcon).toBeCalledWith(name,
          domSanitizer.bypassSecurityTrustResourceUrl(`${env.custom.cdn}/payment-widgets/logos/${name}.svg`),);
      });
    });
  });
});
