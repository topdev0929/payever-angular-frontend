import { CommonModule } from '@angular/common';
import { Injector } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { ErrorBag, FormModule as PeFormModule } from '@pe/forms';
import { I18nModule, LANG, TranslateService } from '@pe/i18n';

import { PE_CHANNELS_GROUPS } from '../../../constants';
import { ApiService } from '../../../core/core.module';
import { ChannelTypes, ProductEditorSections } from '../../../enums';
import { Category, ChannelInterface } from '../../../interfaces';
import { ChannelsService, SectionsService } from '../../../services';
import { EditorChannelsSectionComponent } from './editor-channels-section.component';

describe('EditorChannelsSectionComponent', () => {
  const BUSINESS_ID = 'business_id';

  let component: EditorChannelsSectionComponent;
  let fixture: ComponentFixture<EditorChannelsSectionComponent>;

  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  let channelsApiServiceMock: ChannelsService;
  let translateServiceMock: TranslateService;
  let sectionsServiceMock: SectionsService;

  let activatedRoute: any;
  let channels: any[];

  beforeEach(() => {
    channels = [{
      active: true,
      business: 'business_id',
      channelSet: 'channel_set_id',
      name: 'channel_set_name',
      type: ChannelTypes.Market,
    } as ChannelInterface];

    apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', [
      'getCategories',
      'createCategory',
    ]);
    apiServiceSpy.getCategories.and.returnValue(new Observable<Category | any>());
    apiServiceSpy.createCategory.and.returnValue(new Observable());

    channelsApiServiceMock = {
      channels$: new Observable((observer) => {
        observer.next(channels);
        observer.complete();
      }),
    } as ChannelsService;

    // Object.defineProperty(marketplacesApiService, 'channels$', {
    //   get: () => {
    //     return new Observable((observer) => {
    //       observer.next([{
    //         id: 'id',
    //         type: ChannelTypes.Market,
    //         name: 'Section name 1'
    //       }]);
    //       observer.complete();
    //     });
    //   }
    // });

    translateServiceMock = {
      translate: (key: string) => key,
    } as TranslateService;

    activatedRoute = {
      snapshot: {
        queryParams: {
          channelSet: 'channel_set_id',
          app: '',
          appId: 'appId',
        },
        params: {
          slug: BUSINESS_ID,
        },
      },
    };

    sectionsServiceMock = {
      activeSection$: new Subject<ProductEditorSections>(),
      onFindError: jasmine.createSpy(),
      channelsSection: [{
        id: 'id',
        type: ChannelTypes.Market,
        name: 'Section name 1',

      }],
      channelsGroups: [],
      onChangeChannelsSection: jasmine.createSpy(),
    } as any;


    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        PeFormModule,
        I18nModule,
        MatExpansionModule,
        MatListModule,
        NoopAnimationsModule,
      ],
      providers: [
        ErrorBag,
        { provide: Injector, useValue: null },

        { provide: LANG, useValue: 'en' },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: SectionsService, useValue: sectionsServiceMock },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: ChannelsService, useValue: channelsApiServiceMock },
      ],
      declarations: [
        EditorChannelsSectionComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditorChannelsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('component should be inited successfully', () => {
    const sectionService = TestBed.get(SectionsService);

    const groups = PE_CHANNELS_GROUPS.filter((channelGroup) => {
      return channels.some(channel => channel.type === channelGroup.type);
    });

    expect(component.channelsGroups).toEqual(groups);
    expect(sectionService.channelsGroups).toEqual(groups);
    expect(component.hasChannels).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.formScheme).toBeDefined();
  });

  it('onToggle should update sectionService', () => {
    component.onToggle({ checked: true }, 'channelSetId', ChannelTypes.Market, 'channel_name');

    expect(sectionsServiceMock.onChangeChannelsSection).toHaveBeenCalled();
  });

  it('onSubmit should notify sectionService', () => {
    component.onSubmit();

    expect(sectionsServiceMock.onFindError).toHaveBeenCalled();
  });
});
