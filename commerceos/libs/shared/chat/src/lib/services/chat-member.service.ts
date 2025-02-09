import { Injectable } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { MediaService } from '@pe/media';

import { PeChatMessage, PeMessageChatMember } from '../interfaces';

@Injectable()
export class PeChatMemberService {
  constructor(private mediaService: MediaService) { }
  getNames(member): Array<string> {
    const userAccount = member?.user?.userAccount;
    if (userAccount && (userAccount.firstName || userAccount.lastName)) {
      return [userAccount.firstName || '', userAccount.lastName || ''];
    } else {
      return member?.user?.userAccount?.email ? [member?.user?.userAccount?.email, ''] : ['Anonymous', 'User'];
    }
  }

  getAvatarUrl(image): SafeStyle {
    return this.mediaService.getMediaUrl(image, 'images');
  }

  public mapMemberToChat(value: PeMessageChatMember[]): PeChatMessage[] {
    return value?.map((member) => {
      const allNames = this.getNames(member);
      const fullName = allNames.join(' ');
      const initials = allNames.map(name => name.charAt(0)).join('');
      const logo = (member?.user as any)?.userAccount?.logo;
      const avatar = logo ? (this.getAvatarUrl(logo) as string) : '';

      return { avatar, title: fullName, initials };
    });
  }
}
