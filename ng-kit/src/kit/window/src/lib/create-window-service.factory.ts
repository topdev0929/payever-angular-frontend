import { DeviceType } from '../interfaces';
import { WindowEventsService, WindowService } from '../services';

export function createWindowServiceFactory(platformId: string, windowEventsService: WindowEventsService, deviceType: DeviceType): WindowService {
  return new WindowService(windowEventsService, platformId, deviceType);
}
