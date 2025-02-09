import { PeMessageIntegration } from '../enums';
import { PeMessageService } from './message.service';

describe('PeMessageService', () => {

  const service = new PeMessageService();
  const user: any = { _id: 'u-001' };
  const contactList: any = [{ _id: 'c-001' }]
  const channelSetId = PeMessageIntegration.WhatsApp;
  const subscriptions: any = [{ _id: 's-001' }];

  service.activeUser = user;
  service.contactList = contactList;
  service.channelSetId = channelSetId;
  service.subscriptionList = subscriptions;
  service.userList = [user];

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should have properties', () => {

    expect(service.activeUser).toEqual(user);
    expect(service.contactList).toEqual(contactList);
    expect(service.channelSetId).toEqual(channelSetId);
    expect(service.subscriptionList).toEqual(subscriptions);
    expect(service.userList).toEqual([user]);

  });

  it('should set/get curr settings', () => {

    const nextSpy = spyOn(service[`currSettingsStream$`], 'next').and.callThrough();
    const settings: any = { _id: 't-001' };

    service.currSettings = settings;

    expect(nextSpy).toHaveBeenCalledWith(settings);
    expect(service.currSettings).toEqual(settings);
    service.currSettings$.subscribe(cs => expect(cs).toEqual(settings));

  });

  it('should set/get bubble', () => {

    const nextSpy = spyOn(service[`bubbleStream$`], 'next').and.callThrough();
    const bubble = { bgColor: '#333333' };

    service.bubble = bubble;

    expect(nextSpy).toHaveBeenCalledWith(bubble);
    expect(service.bubble).toEqual(bubble);
    service.bubble$.subscribe(b => expect(b).toEqual(bubble));

  });

});
