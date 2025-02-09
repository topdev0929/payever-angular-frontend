import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { from, of, throwError } from 'rxjs';
import { delay, switchMap, take, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { DialogService } from '@pe/checkout/dialog';
import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, fakeOverlayContainer } from '@pe/checkout/testing';

import { SantanderDeFlowService } from '../../../shared/services';
import { WebIDIdentMode } from '../../../shared/types';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { AdditionalStepsModule } from '../../additional-steps.module';
import { INPUTS } from '../../injection-token.constants';

import { IdentificationComponent } from './identification.component';


describe('IdentificationComponent', () => {
  let component: IdentificationComponent;
  let fixture: ComponentFixture<IdentificationComponent>;
  let loader: HarnessLoader;
  let store: Store;

  const overlayContainer = fakeOverlayContainer();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      providers: [
        overlayContainer.fakeElementContainerProvider,
        ...CommonProvidersTestHelper(),
        DialogService,
        {
          provide: INPUTS,
          useValue: {
            next: jest.fn(),
            skip: jest.fn(),
          },
        },
        ApiService,
      ],
      declarations: [
        IdentificationComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(IdentificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
    fixture.debugElement.nativeElement.appendChild(overlayContainer.overlayContainerElement);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetAllMocks();
    fixture?.destroy();
  });

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('component', () => {
    it('Should handel errors getWebIDIdentificationURL', () => {
      const flowData: any = {
        flow_data: 'some_value',
      };
      const identMode = WebIDIdentMode.VideoIdent;
      component.ngOnInit();
      fixture.detectChanges();
      const videoChat = fixture.debugElement.query(By.css(`.action-card-${identMode}`));
      expect(videoChat).toBeTruthy();
      videoChat.nativeElement.click();
      const getWebIDIdentificationURL = jest.spyOn(
        SantanderDeFlowService.prototype,
        'getWebIDIdentificationURL'
      ).mockReturnValue(throwError(new Error()));

      jest.spyOn(ApiService.prototype, '_getFlow').mockReturnValue(of(flowData));

      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap(() => {
          const confirm: HTMLButtonElement = overlayContainer.overlayContainerElement
            .querySelector('.action-button');
          confirm.click();
          fixture.detectChanges();
          expect(getWebIDIdentificationURL).toBeCalledWith(identMode);

          const error = fixture.debugElement.query(By.css('.error-container'));
          expect(error).toBeTruthy();

          expect(fixture.debugElement.query(By.css('.loading-spinner')))
            .toBeFalsy();

          videoChat.nativeElement.click();
        }),
        switchMap(() => from(loader.getAllHarnesses(MatDialogHarness))),
        tap((confirmDialog) => {
          expect(confirmDialog).toHaveLength(1);
        })
      ).toPromise();
    });

    it('Should handel errors saveDataBeforeRedirect', () => {
      const flowData: any = {
        flow_data: 'some_value',
      };
      const identMode = WebIDIdentMode.VideoIdent;
      component.ngOnInit();
      fixture.detectChanges();
      const videoChat = fixture.debugElement.query(By.css(`.action-card-${identMode}`));
      expect(videoChat).toBeTruthy();
      videoChat.nativeElement.click();
      const getWebIDIdentificationURL = jest.spyOn(
        SantanderDeFlowService.prototype,
        'getWebIDIdentificationURL'
      ).mockReturnValue(of({
        paymentDetails: {
          customerSigningLink: 'customerSigningLink',
        },
      } as any));

      const saveDataBeforeRedirect = jest.spyOn(
        ExternalRedirectStorage.prototype,
        'saveDataBeforeRedirect'
      ).mockReturnValue(throwError(new Error()));

      const redirect = jest.spyOn(TopLocationService.prototype, 'href', 'set')
        .mockImplementation();

      jest.spyOn(ApiService.prototype, '_getFlow').mockReturnValue(of(flowData));

      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap(() => {
          const confirm: HTMLButtonElement = overlayContainer.overlayContainerElement
            .querySelector('.action-button');
          confirm.click();
          fixture.detectChanges();
          expect(getWebIDIdentificationURL).toBeCalledWith(identMode);
          expect(saveDataBeforeRedirect).toBeCalledWith(flowData);

          const error = fixture.debugElement.query(By.css('.error-container'));
          expect(error).toBeTruthy();

          expect(fixture.debugElement.query(By.css('.loading-spinner')))
            .toBeFalsy();

          expect(redirect).toBeCalledWith('customerSigningLink');


          videoChat.nativeElement.click();
        }),
        switchMap(() => from(loader.getAllHarnesses(MatDialogHarness))),
        tap((confirmDialog) => {
          expect(confirmDialog).toHaveLength(1);
        })
      ).toPromise();
    });

    it('VideoChat should open confirm dialog', () => {
      const flowData: any = {
        flow_data: 'some_value',
      };
      const identMode = WebIDIdentMode.VideoIdent;
      component.ngOnInit();
      fixture.detectChanges();
      const videoChat = fixture.debugElement.query(By.css(`.action-card-${identMode}`));
      expect(videoChat).toBeTruthy();
      videoChat.nativeElement.click();
      const getWebIDIdentificationURL = jest.spyOn(
        SantanderDeFlowService.prototype,
        'getWebIDIdentificationURL'
      ).mockReturnValue(
        of({
          paymentDetails: {
            customerSigningLink: 'customerSigningLink',
          },
        } as any).pipe(delay(200))
      );

      jest.spyOn(ApiService.prototype, '_getFlow').mockReturnValue(of(flowData));
      const redirect = jest.spyOn(TopLocationService.prototype, 'href', 'set')
        .mockImplementation();

      const saveDataBeforeRedirect = jest.spyOn(
        ExternalRedirectStorage.prototype,
        'saveDataBeforeRedirect'
      ).mockReturnValue(of(null));

      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap(() => {
          const confirm: HTMLButtonElement = overlayContainer.overlayContainerElement
            .querySelector('.action-button');
          confirm.click();
          fixture.detectChanges();
          expect(component.isLoading$.value).toBe(identMode);
          const videoChatLoading = fixture.debugElement.query(By.css(`.loading-spinner-${identMode}`));
          expect(videoChatLoading).toBeTruthy();
          expect(getWebIDIdentificationURL).toBeCalledWith(identMode);
        }),
        delay(200),
        tap(() => {
          expect(saveDataBeforeRedirect).toBeCalledWith(flowData);
          expect(redirect).toBeCalledWith('customerSigningLink');
        })
      ).toPromise();
    });

    it('KontoIdent should open confirm dialog', () => {
      const flowData: any = {
        flow_data: 'some_value',
      };
      const identMode = WebIDIdentMode.PayIdent;
      component.ngOnInit();
      fixture.detectChanges();
      const videoChat = fixture.debugElement.query(By.css(`.action-card-${identMode}`));
      expect(videoChat).toBeTruthy();
      videoChat.nativeElement.click();
      const getWebIDIdentificationURL = jest.spyOn(
        SantanderDeFlowService.prototype,
        'getWebIDIdentificationURL'
      ).mockReturnValue(
        of({
          paymentDetails: {
            customerSigningLink: 'customerSigningLink',
          },
        } as any).pipe(delay(200))
      );

      jest.spyOn(ApiService.prototype, '_getFlow').mockReturnValue(of(flowData));
      const redirect = jest.spyOn(TopLocationService.prototype, 'href', 'set')
        .mockImplementation();

      const saveDataBeforeRedirect = jest.spyOn(
        ExternalRedirectStorage.prototype,
        'saveDataBeforeRedirect'
      ).mockReturnValue(of(null));

      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap(() => {
          const confirm: HTMLButtonElement = overlayContainer.overlayContainerElement
            .querySelector('.action-button');
          confirm.click();
          fixture.detectChanges();
          expect(component.isLoading$.value).toBe(identMode);
          const videoChatLoading = fixture.debugElement.query(By.css(`.loading-spinner-${identMode}`));
          expect(videoChatLoading).toBeTruthy();
          expect(getWebIDIdentificationURL).toBeCalledWith(identMode);
        }),
        delay(200),
        tap(() => {
          expect(saveDataBeforeRedirect).toBeCalledWith(flowData);
          expect(redirect).toBeCalledWith('customerSigningLink');
        })
      ).toPromise();
    });

    it('should ignore clicks if loading', () => {
      const identMode = WebIDIdentMode.PayIdent;
      component.ngOnInit();
      fixture.detectChanges();
      const videoChat = fixture.debugElement.query(By.css(`.action-card-${identMode}`));
      expect(videoChat).toBeTruthy();
      component.isLoading$.next(WebIDIdentMode.VideoIdent);

      videoChat.nativeElement.click();
      
      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap((dialogs) => {
          expect(dialogs).toHaveLength(0);
        })
      ).toPromise();
    });

    it('skip-button', () => {
      const skipButton = fixture.debugElement.query(By.css('.skip-button a'));
      const skip = jest.spyOn(IdentificationComponent.prototype, 'skip');
      skipButton.nativeElement.click();
      expect(skip).toBeCalled();
    });
  });
});
