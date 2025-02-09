import { ElementRef, Injectable } from '@angular/core';
import { Action, Notification } from '../dashboard-doc.interface';

@Injectable()
export class DockerService {

  getNotifications(notifications: Notification[]): any {
    return notifications.map((notification: Notification) => {
      return {
        uuid: notification.uuid,
        logo: notification.logo,
        appAction: notification.actions.find((notificationAction: Action) => {
          if (notificationAction.type === 'app') {
            return true;
          }
        }),
        skipAction: notification.actions.find((notificationAction: Action) => {
          if (notificationAction.type === 'skip') {
            return true;
          }
        }),
        headline: notification.headline,
        subline: notification.subline,
        settings: notification.settings
      };
    });
  }


  createAppsSwiperConfig(): SwiperOptions {
    const swiperConfig: SwiperOptions = {
      slidesPerView: 4,
      slidesPerColumn: 2,
      slidesPerGroup: 4,
      spaceBetween: 0,
      slidesPerColumnFill: 'row'
    };
    return swiperConfig;
  }


  createSettingsSwiperConfig(): SwiperOptions {
    const swiperConfig: SwiperOptions = {
      slidesPerView: 4,
      slidesPerColumn: 2,
      slidesPerGroup: 4,
      spaceBetween: 0,
      slidesPerColumnFill: 'row'
    };
    return swiperConfig;
  }

  createMobileNotifySwiperConfig(): SwiperOptions {
    const swiperConfig: SwiperOptions = {
      slidesPerView: 1,
      slidesPerColumn: 1,
      slidesPerGroup: 1,
      spaceBetween: 0
    };
    return swiperConfig;
  }

  createNotifySwiperConfig(nextButton?: ElementRef, prevButton?: ElementRef): SwiperOptions {
    const swiperConfig: SwiperOptions = {
      navigation: {
        nextEl: nextButton.nativeElement,
        prevEl: prevButton.nativeElement
      },
      pagination: {
        clickable: true
      },
      slidesPerView: 2.5,
      slidesPerColumn: 1,
      slidesPerGroup: 1,
      spaceBetween: 0
    };
    return swiperConfig;
  }

}
