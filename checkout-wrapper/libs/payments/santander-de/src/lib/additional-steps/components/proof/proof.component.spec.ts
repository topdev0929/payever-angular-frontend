import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatDialogHarness } from '@angular/material/dialog/testing';
import { By } from '@angular/platform-browser';
import { cold } from 'jest-marbles';
import { ReplaySubject, from, of, throwError } from 'rxjs';
import { skip, take, tap } from 'rxjs/operators';

import { CommonImportsTestHelper, CommonProvidersTestHelper, fakeOverlayContainer } from '@pe/checkout/testing';

import { SantanderDeFlowService } from '../../../shared/services';
import { AdditionalStepsModule } from '../../additional-steps.module';
import { INPUTS } from '../../injection-token.constants';
import { DocumentDataInterface } from '../upload-documents';

import { ProofComponent } from './proof.component';

describe('ProofComponent', () => {
  let component: ProofComponent;
  let fixture: ComponentFixture<ProofComponent>;
  let loader: HarnessLoader;

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
        {
          provide: INPUTS,
          useValue: {
            next: jest.fn(),
            skip: jest.fn(),
          },
        },
      ],
      declarations: [
        ProofComponent,
      ],
    });

    fixture = TestBed.createComponent(ProofComponent);
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
    it('VideoChat should open confirm dialog', () => {
      fixture.detectChanges();
      const uploadAction = fixture.debugElement.query(By.css('.action-card'));
      expect(uploadAction).toBeTruthy();
      uploadAction.nativeElement.click();

      return from(loader.getAllHarnesses(MatDialogHarness)).pipe(
        take(1),
        tap(() => {
          const back: HTMLButtonElement = overlayContainer.overlayContainerElement.querySelector('.back-button');
          back.click();
        }),
      ).toPromise();
    });

    it('skip', () => {
      const skipButton = fixture.debugElement.query(By.css('.skip-button a'));
      expect(skipButton).toBeTruthy();
      const skip = jest.spyOn(ProofComponent.prototype, 'skip');
      skipButton.nativeElement.click();
      expect(skip).toBeCalled();
    });

    it('upload docs', (done) => {
      fixture.detectChanges();
      let onClose: (docs: DocumentDataInterface[]) => void;
      const open = jest.spyOn(MatDialog.prototype, 'open');
      open.mockImplementation((_, config: MatDialogConfig) => {
        onClose = config.data.close;

        return {
          close: jest.fn(),
        } as any;
      });
      jest.spyOn(SantanderDeFlowService.prototype, 'sendDocuments')
        .mockImplementation(() => of(null));

      const uploadAction = fixture.debugElement.query(By.css('.action-card'));
      expect(uploadAction).toBeTruthy();
      uploadAction.nativeElement.click();

      expect(open).toHaveBeenCalled();


      const replay$ = new ReplaySubject<boolean>();
      component.isUploading$.subscribe(replay$);

      component.isUploading$.pipe(
        skip(2),
        tap(() => {
          expect(replay$).toBeObservable(cold('(ftf)', { t: true, f: false }));
          done();
        })
      ).subscribe();
      onClose([
        {
          filename: 'filename',
          base64: 'base64',
          type: 'png',
        },
      ]);
    });
  });

  it('should ignore clicks if loading', () => {
    const open = jest.spyOn(MatDialog.prototype, 'open');
    component.isUploading$.next(true);

    const uploadAction = fixture.debugElement.query(By.css('.action-card'));
    expect(uploadAction).toBeTruthy();
    uploadAction.nativeElement.click();

    expect(open).toBeCalledTimes(0);
  });


  it('should handle errors upload docs', (done) => {
    fixture.detectChanges();
    let onClose: (docs: DocumentDataInterface[]) => void;
    const open = jest.spyOn(MatDialog.prototype, 'open');
    open.mockImplementation((_, config: MatDialogConfig) => {
      onClose = config.data.close;

      return {
        close: jest.fn(),
      } as any;
    });
    jest.spyOn(SantanderDeFlowService.prototype, 'sendDocuments')
      .mockImplementation(() => throwError(new Error()));

    const uploadAction = fixture.debugElement.query(By.css('.action-card'));
    expect(uploadAction).toBeTruthy();
    uploadAction.nativeElement.click();

    expect(open).toHaveBeenCalled();


    const replay$ = new ReplaySubject<boolean>();
    component.isUploading$.subscribe(replay$);

    component.isUploading$.pipe(
      skip(2),
      tap(() => {
        expect(replay$).toBeObservable(cold('(ftf)', { t: true, f: false }));
        done();
      })
    ).subscribe();
    onClose([
      {
        filename: 'filename',
        base64: 'base64',
        type: 'png',
      },
    ]);
  });
});
