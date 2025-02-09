import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import { EnvironmentConfigService, NodeJsBackendConfigInterface } from '../../environment-config';
import { ProductsListEnvConfigService } from '../../config';
import { ImportApiService, SyncDirectionEnum, SyncKindEnum, SyncStatusEnum } from './import-api.service';

describe('ImportApiService', () => {
  let testScheduler: TestScheduler;

  let importService: ImportApiService;
  let httpTestingController: HttpTestingController;

  let configServiceSpy: jasmine.SpyObj<EnvironmentConfigService>;
  let listEnvServiceSpy: jasmine.SpyObj<ProductsListEnvConfigService>;
  let config: NodeJsBackendConfigInterface;

  const slug = 'test_slug';

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    config = {
      synchronizer: 'test://synchronizer',
    } as any;

    configServiceSpy = jasmine.createSpyObj<EnvironmentConfigService>('EnvironmentConfigService', ['getBackendConfig']);
    configServiceSpy.getBackendConfig.and.returnValue(config);

    listEnvServiceSpy = jasmine.createSpyObj<ProductsListEnvConfigService>('ProductsListEnvConfigService', ['getSlug']);
    listEnvServiceSpy.getSlug.and.returnValue(slug);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImportApiService,
        { provide: EnvironmentConfigService, useValue: configServiceSpy },
        { provide: ProductsListEnvConfigService, useValue: listEnvServiceSpy },
      ],
      imports: [
        HttpClientTestingModule,
      ],
    });

    httpTestingController = TestBed.get(HttpTestingController);
    importService = TestBed.get(ImportApiService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be defined', () => {
    expect(importService).toBeDefined();
  });

  it('#env should get config', () => {
    expect(importService.env).toBe(config);
    expect(configServiceSpy.getBackendConfig).toHaveBeenCalled();
  });

  it('#checkImportStatus should check active tasks', () => {
    const getTasksSpy: jasmine.Spy = spyOn(importService, 'getTasks');
    getTasksSpy.and.returnValue(of([]));

    importService.checkImportStatus();

    expect(getTasksSpy).toHaveBeenCalledWith(slug, {
      status: [SyncStatusEnum.IN_PROGRESS, SyncStatusEnum.IN_QUEUE],
      direction: SyncDirectionEnum.INWARD,
      kind: SyncKindEnum.FILE_IMPORT,
    });
  });

  it('#checkImportStatus should check tasks status until it`s busy', () => {
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;

      const values: { [key: string]: any } = { a: [0], b: [0], c: [], x: true, y: true, z: false };
      const source = helpers.cold('(a)(b)(c)', values);

      const result = source.pipe(importService.statusCheckOperator);

      expectObservable(result).toBe('30s x -- y -- |', values);
    });
  });
});
