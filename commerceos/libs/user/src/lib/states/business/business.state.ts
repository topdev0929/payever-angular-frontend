import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { catchError, switchMap, tap } from 'rxjs/operators';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  BusinessAccessOptionsInterface,
  BusinessApiService,
  BusinessInterface,
  BusinessThemeSettings,
} from '@pe/business';
import { AppThemeEnum } from '@pe/common';

import * as BusinessActions from './business.actions';

const businessStateName = 'peBusinessState';

export interface PeBusinessState {
  loading: boolean;
  businessData: BusinessInterface;
  businesses: { businesses: BusinessInterface[], total: number };
  defaultBusiness: BusinessInterface;
  businessAccessOptions: BusinessAccessOptionsInterface,
}

export const initialBusinessData: BusinessInterface = {
  active: null,
  bankAccount: null,
  companyAddress: null,
  companyDetails: null,
  contactDetails: null,
  contactEmails: [],
  createdAt: null,
  cspAllowedHosts: [],
  currency: null,
  currentWallpaper: null,
  defaultLanguage: null,
  documents: null,
  hidden: null,
  logo: null,
  name: null,
  owner: null,
  taxes: null,
  themeSettings: null,
  updatedAt: null,
  _id: null,
};

@State<PeBusinessState>({
  name: businessStateName,
  defaults: {
    loading: false,
    businessData: initialBusinessData,
    businesses: { businesses: [], total: 0 },
    defaultBusiness: initialBusinessData,
    businessAccessOptions: null,
  },
})
@Injectable()
export class BusinessState {
  @Selector()
  static loading(state: PeBusinessState): boolean {
    return state.loading;
  }

  @Selector([BusinessState.businessThemeSettings])
  static businessThemeSettingsTheme(state: BusinessThemeSettings): AppThemeEnum {
    return AppThemeEnum[state.theme] || AppThemeEnum.dark;
  }

  @Selector([BusinessState.businessData])
  static businessThemeSettings(state: BusinessInterface): BusinessThemeSettings {
    return state.themeSettings;
  }

  @Selector()
  static businessData(state: PeBusinessState): BusinessInterface {
    return state.businessData;
  }

  @Selector()
  static businessAccessOptions(state: PeBusinessState): BusinessAccessOptionsInterface {
    return state.businessAccessOptions;
  }

  @Selector()
  static defaultBusiness(state: PeBusinessState): BusinessInterface {
    return state.defaultBusiness;
  }


  @Selector()
  static businessUuid(state: PeBusinessState): string {
    return state.businessData?._id ?? '';
  }

  @Selector()
  static businesses(state: PeBusinessState): { businesses: BusinessInterface[], total: number } {
    return state.businesses;
  }

  constructor(
    private apiService: BusinessApiService,
    ) {
  }

  @Action(BusinessActions.UpdateBusinessData, { cancelUncompleted: true })
  UpdateBusinessData({ patchState, dispatch }: StateContext<PeBusinessState>,
    { id, businessData }: BusinessActions.UpdateBusinessData) {

    patchState({
      loading: true,
    });

    return this.apiService.updateBusinessData(id, businessData).pipe(
      switchMap(() => {
        return this.apiService.getBusinessData(id).pipe(
          tap((data: BusinessInterface) => {
            dispatch(new BusinessActions.BusinessDataLoaded(data));
          })
        );
      }),
      catchError((err: HttpErrorResponse) => dispatch(new BusinessActions.LoadBusinessFailed(err)))
    );
  }


  @Action(BusinessActions.LoadBusinessData)
  loadBusinessData(ctx: StateContext<PeBusinessState>, { uuid }: BusinessActions.LoadBusinessData) {
    ctx.patchState({
      loading: true,
    });

    return this.apiService.getBusinessData(uuid).pipe(
      tap((data: BusinessInterface) => ctx.dispatch(new BusinessActions.BusinessDataLoaded(data))),
      switchMap(() => this.apiService.checkAccess(uuid)),
      tap(accessOptions => ctx.dispatch(new BusinessActions.BusinessAccessOptions(accessOptions))),
      catchError((err: HttpErrorResponse) => ctx.dispatch(new BusinessActions.LoadBusinessFailed(err))),
    );
  }

  @Action(BusinessActions.BusinessDataLoaded)
  businessDataLoaded(ctx: StateContext<PeBusinessState>, { payload }: BusinessActions.BusinessDataLoaded) {
    ctx.patchState({
      loading: false,
      businessData: payload,
    });
  }

  @Action(BusinessActions.BusinessAccessOptions)
  businessAccessOptions(ctx: StateContext<PeBusinessState>, { payload }: BusinessActions.BusinessAccessOptions<BusinessAccessOptionsInterface>) {
    ctx.patchState({
      loading: false,
      businessAccessOptions: payload,
    });
  }

  @Action(BusinessActions.LoadBusinesses)
  loadBusinesses(ctx: StateContext<PeBusinessState>, { active, page, limit, reload }: BusinessActions.LoadBusinesses) {
    ctx.patchState({
      loading: true,
    });

    return this.apiService.getBusinessesList('true', page, limit).pipe(
      tap((data: { businesses: BusinessInterface[], total: number }) =>
        ctx.dispatch(new BusinessActions.BusinessesLoaded(data, reload))),
      catchError((err: HttpErrorResponse) => ctx.dispatch(new BusinessActions.LoadBusinessFailed(err))),
    );
  }

  @Action(BusinessActions.BusinessesLoaded)
  businessesLoaded(ctx: StateContext<PeBusinessState>, { payload, reload }: BusinessActions.BusinessesLoaded) {
    const currentState = ctx.getState();
    if (reload) {
      ctx.patchState(
        {
          loading: false,
          businesses: payload,
        },
      );

      return;
    }
    ctx.patchState({
      loading: false,
      businesses: {
        businesses: [...currentState.businesses.businesses, ...payload.businesses],
        total: payload.total,
      },
    });
  }

  @Action(BusinessActions.DefaultBusinessesLoaded)
  defaultBusinessesLoaded(ctx: StateContext<PeBusinessState>, { payload }: BusinessActions.DefaultBusinessesLoaded) {
    ctx.patchState(
      {
        loading: false,
        defaultBusiness: payload,
      },
    );
  }

  @Action(BusinessActions.LoadBusinessFailed)
  loadBusinessFailed(ctx: StateContext<PeBusinessState>) {
    ctx.patchState({
      loading: false,
    });
  }

  @Action(BusinessActions.ResetBusinessState)
  resetBusinessState(ctx: StateContext<PeBusinessState>) {
    ctx.patchState({
      loading: false,
      businessData: initialBusinessData,
      businesses: { businesses: [], total: 0 },
    });
  }

}
