import { Overlay } from '@angular/cdk/overlay';
import { PortalInjector } from '@angular/cdk/portal';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeChatAttachMenuItem, PeChatChannelMenuItem } from '@pe/chat';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { of, Subject } from 'rxjs';
import { PeMessageApiService, PeMessageService } from '../../services';
import { PeMessageChatRoomFormComponent } from './message-chat-room-form.component';

describe('PeMessageChatRoomFormComponent', () => {

  let fixture: ComponentFixture<PeMessageChatRoomFormComponent>;
  let component: PeMessageChatRoomFormComponent;
  let overlayRef: any;
  let overlay: jasmine.SpyObj<Overlay>;
  let backdropSubject: Subject<void>;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let peOverlayData: any;
  let peOverlayConfig: any;
  let peMessageServiceMock: any;

  beforeEach(waitForAsync(() => {

    backdropSubject = new Subject();
    overlayRef = {
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdropSubject),
      attach: jasmine.createSpy('attach'),
      dispose: jasmine.createSpy('dispose'),
    };
    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      create: overlayRef,
      position: {
        global() {
          return {
            centerHorizontally() {
              return {
                centerVertically() {
                  return { test: 'position.strategy' };
                },
              };
            },
          };
        },
      } as any,
    });

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', ['getProductCheckoutLink']);

    peMessageServiceMock = {
      currSettings: {
        settings: null,
      },
    };

    const peOverlayDataMock = {
      sender: 'James Bond',
      contactList: [
        {
          _id: 'c-001',
          name: 'Contact 1',
          avatar: 'avatar.1',
        },
        {
          _id: 'c-002',
          name: 'Contact 2',
          avatar: 'avatar.2',
        },
      ],
      onCloseSubject$: {
        next: jasmine.createSpy('next'),
      },
    };

    const peOverlayConfigMock = { theme: 'light' };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      declarations: [PeMessageChatRoomFormComponent],
      providers: [
        { provide: Overlay, useValue: overlaySpy },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: peOverlayConfigMock },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageChatRoomFormComponent);
      component = fixture.componentInstance;

      overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;
      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      peOverlayData = TestBed.inject(PE_OVERLAY_DATA);
      peOverlayConfig = TestBed.inject(PE_OVERLAY_CONFIG);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set color props on construct', () => {

    /**
     * peMessageService.currSettings.settings is null
     */
    expect(component.messageAppColor).toEqual('');
    expect(component.accentColor).toEqual('');
    expect(component.bgChatColor).toEqual('');

    /**
     * peMessageService.currSettings.settings is set
     */
    peMessageServiceMock.currSettings.settings = {
      messageAppColor: '#333333',
      accentColor: '#222222',
      bgChatColor: '#111111',
    };

    fixture = TestBed.createComponent(PeMessageChatRoomFormComponent);
    component = fixture.componentInstance;

    expect(component.messageAppColor).toEqual('#333333');
    expect(component.accentColor).toEqual('#222222');
    expect(component.bgChatColor).toEqual('#111111');

  });

  it('should set sender, theme & items on construct', () => {

    expect(component.sender).toEqual(peOverlayData.sender);
    expect(component.theme).toEqual(peOverlayConfig.theme);
    expect(component.items).toEqual(peOverlayData.contactList.map((c: any) => ({
      title: c.name,
      value: c._id,
    })));

  });

  it('should handle close', () => {

    component.onClose();

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith(true);

  });

  it('should handle selected', () => {

    const event = { value: 'c-003' };
    const contact = {
      _id: 'c-001',
      name: 'Contact 1',
      communications: [],
    };

    peOverlayData.contactList = [contact];

    /**
     * contact does not exist in peOverlayData.contactList
     */
    component.onSelected(event);

    expect(component.contact).toBeUndefined();
    expect(component.activeChannel).toBeUndefined();
    expect(component.channelMenuItems).toBeUndefined();

    /**
     * contact exists in peOverlayData.contactList
     * contact.communications is [] (empty array)
     */
    event.value = contact._id;
    component.onSelected(event);

    expect(component.contact).toEqual(contact as any);
    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.WhatsApp);
    expect(component.channelMenuItems).toEqual([]);

    /**
     * contact.communications is set
     */
    contact.communications = [
      { integrationName: PeChatChannelMenuItem.FacebookMessenger },
      { integrationName: PeChatChannelMenuItem.WhatsApp },
    ] as any;

    component.onSelected(event);

    expect(component.contact).toEqual(contact as any);
    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.FacebookMessenger);
    expect(component.channelMenuItems).toEqual([
      PeChatChannelMenuItem.FacebookMessenger,
      PeChatChannelMenuItem.WhatsApp,
    ]);

  });

  it('should send message', () => {

    const event = { message: 'message' };

    /**
     * component.contact is undefined
     */
    component.activeChannel = PeChatChannelMenuItem.WhatsApp;
    component.contact = undefined;
    component.sendMessage(event);

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith({
      contact: undefined,
      content: event.message,
      integrationName: PeChatChannelMenuItem.WhatsApp,
    });

    /**
     * component.contact is set
     */
    component.contact = { _id: 'c-001' } as any;
    component.sendMessage(event);

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith({
      contact: 'c-001',
      content: event.message,
      integrationName: PeChatChannelMenuItem.WhatsApp,
    });

  });

  it('should set active channel', () => {

    component.channelMenuItem(PeChatChannelMenuItem.FacebookMessenger);

    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.FacebookMessenger);

  });

  it('should attach menu item', () => {

    const openSpy = spyOn<any>(component, 'openOverlayProductList');

    /**
     * item is 'file'
     */
    component.attachMenuItem(PeChatAttachMenuItem.File);

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * item is 'product'
     */
    component.attachMenuItem(PeChatAttachMenuItem.Product);

    expect(openSpy).toHaveBeenCalled();

  });

  it('should create injector', () => {

    const config = {
      data: { test: 'data' },
      headerConfig: { test: 'config' },
    };

    const injector = component[`createInjector`](config);

    expect(injector).toBeInstanceOf(PortalInjector);
    expect(injector.get(PE_OVERLAY_DATA)).toEqual(config.data);
    expect(injector.get(PE_OVERLAY_CONFIG)).toEqual(config.headerConfig);

  });

  it('should open overlay product list', () => {

    const createSpy = spyOn<any>(component, 'createInjector').and.callThrough();
    const sendSpy = spyOn(component, 'sendMessage');

    component[`openOverlayProductList`]();

    expect(overlay.create).toHaveBeenCalledWith({
      panelClass: 'pe-message-chat-products-overlay',
      positionStrategy: { test: 'position.strategy' },
      hasBackdrop: true,
    } as any);
    expect(overlay.position).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalled();
    let overlayConfig = createSpy.calls.argsFor(0)[0] as PeOverlayConfig;
    expect(overlayConfig.data).toEqual({ theme: peOverlayConfig.theme });
    expect(overlayConfig.headerConfig?.title).toEqual('translated');
    expect(overlayConfig.headerConfig?.theme).toEqual(peOverlayConfig.theme);
    expect(overlayRef.backdropClick).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();
    expect(overlayRef.dispose).not.toHaveBeenCalled();
    expect(translateService.translate).toHaveBeenCalledTimes(1);
    expect(translateService.translate).toHaveBeenCalledWith('message-app.chat-room.products');

    /**
     * test backdrop click
     */
    backdropSubject.next();
    expect(overlayRef.dispose).toHaveBeenCalled();

    /**
     * test onSaveSubject$ emit
     * productIds is [] (empty array)
     */
    overlayRef.dispose.calls.reset();
    overlayConfig.headerConfig?.onSaveSubject$?.next([]);

    expect(peMessageApiService.getProductCheckoutLink).not.toHaveBeenCalled();
    expect(sendSpy).not.toHaveBeenCalled();
    expect(overlayRef.dispose).toHaveBeenCalled();

    /**
     * productIds is set
     */
    overlayRef.dispose.calls.reset();
    peMessageApiService.getProductCheckoutLink.and.returnValue(of({ link: 'checkout.link' }));

    component.activeChannel = PeChatChannelMenuItem.WhatsApp;
    component[`openOverlayProductList`]();

    overlayConfig = createSpy.calls.argsFor(1)[0] as PeOverlayConfig;
    overlayConfig.headerConfig?.onSaveSubject$?.next(['prod-001']);

    expect(peMessageApiService.getProductCheckoutLink).toHaveBeenCalledWith({
      productIds: ['prod-001'],
      type: PeChatChannelMenuItem.WhatsApp,
    });
    expect(sendSpy).toHaveBeenCalledWith({ message: 'checkout.link' });

  });

});
