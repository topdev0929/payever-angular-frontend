import { TestBed } from '@angular/core/testing';
import '@angular/localize/init';

import { FormConfigService } from './form-config.service';

describe('FormConfigService', () => {

  let service: FormConfigService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        FormConfigService,
      ],
    });

    service = TestBed.inject(FormConfigService);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sectionsConfig return correct config', () => {
    expect(service.sectionsConfig()).toEqual(
      [
        {
          name: 'mitidSkat',
          title: expect.any(String),
          isButtonHidden: true,
        },
        {
          name: 'appDetails',
          title: expect.any(String),
          continueButtonTitle: expect.any(String),
          isButtonHidden: true,
        },
      ],
    );
  });

});
