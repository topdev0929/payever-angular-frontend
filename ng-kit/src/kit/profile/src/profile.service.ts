import { Observable, of, throwError as observableThrowError, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { catchError, map, share } from 'rxjs/operators';

import * as settings from './settings';
import { ProfileInterface, ProfileSettingsInterface } from './profile.interfaces';
import { HttpClient } from '@angular/common/http';

interface CashedInterface {
  profile: ProfileInterface;
  profileSettings: ProfileSettingsInterface;
}

interface ObservableInterface {
  profile: Observable<ProfileInterface>;
  profileSettings: Observable<ProfileSettingsInterface>;
}

type DataType = 'profile' | 'profileSettings';

type ProfileResponseType = ProfileInterface | ProfileSettingsInterface;

@Injectable()
export class ProfileService {
  private cashed: CashedInterface = {
    profile: null,
    profileSettings: null
  };
  private observable: ObservableInterface = {
    profile: null,
    profileSettings: null
  };

  constructor(private http: HttpClient) {
  }

  get profile(): ProfileInterface {
    return this.cashed.profile;
  }

  get profileSettings(): ProfileSettingsInterface {
    return this.cashed.profileSettings;
  }

  clearCache(): void {
    this.cashed.profile = null;
    this.cashed.profileSettings = null;
  }

  getProfile(id: string, prefix: string, reset: boolean = false): Observable<ProfileInterface> {
    if (!reset && this.cashed.profile && this.cashed.profile.id === id) {
      return of(this.cashed.profile);
    }
    else {
      this.request('profile', settings.urls['getProfile'](id, prefix), reset);
    }
    return this.observable.profile;
  }

  getProfileSettings(prefix: string, reset: boolean = false): Observable<ProfileSettingsInterface> {
    if (!reset && this.cashed.profileSettings) {
      return of(this.cashed.profileSettings);
    }
    else {
      this.request('profileSettings', settings.urls['getProfileSettings'](prefix), reset);
    }
    return this.observable.profileSettings;
  }

  private request(dataType: DataType, url: string, reset: boolean): void {
    if (reset || !this.observable[dataType]) {
      this.observable[dataType] = this.http.get(url, { withCredentials: true })
        .pipe(
          map((response: ProfileInterface & ProfileSettingsInterface) => {
            this.cashed[dataType] = response;
            this.observable[dataType] = null;
            return this.cashed[dataType];
          }),
          catchError((error: Response) => {
            this.cashed[dataType] = null;
            this.observable[dataType] = null;
            return throwError(error);
          }),
          share()
        ) as any;
    }
  }

}
