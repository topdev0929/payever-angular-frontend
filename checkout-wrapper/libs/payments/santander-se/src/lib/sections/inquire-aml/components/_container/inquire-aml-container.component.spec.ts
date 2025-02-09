import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponents, MockModule } from 'ng-mocks';

import { ModeEnum } from '@pe/checkout/form-utils';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { SantanderSeInquiryModule } from '../../../../inquiry/santander-se-inquiry.module';
import { InquireAmlComponent } from '../_form';
import { SummaryAmlComponent } from '../summary';

import { InquireAmlContainerComponent } from './inquire-aml-container.component';

describe('pe-santander-se-inquire-aml', () => {
  let component: InquireAmlContainerComponent;
  let fixture: ComponentFixture<InquireAmlContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(SantanderSeInquiryModule),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        InquireAmlContainerComponent,
        MockComponents(
          InquireAmlComponent,
          SummaryAmlComponent
        ),
      ],
    });
    fixture = TestBed.createComponent(InquireAmlContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('component', () => {
    it('should on submit ', (done) => {
      const formData = {};
      component.submitted.subscribe((v) => {
        expect(v).toEqual(formData);
        done();
      });

      component.onSubmit(formData);
    });

    it('should display form component ', () => {
      fixture.componentRef.setInput('mode', ModeEnum.Edit);
      fixture.detectChanges();
      const inquireAmlComponent = fixture.debugElement.query(By.directive(InquireAmlComponent))?.nativeElement;

      expect(inquireAmlComponent).toBeTruthy();
    });

    it('should display view component ', () => {
      fixture.componentRef.setInput('mode', ModeEnum.View);
      fixture.detectChanges();
      const summaryAmlComponent = fixture.debugElement.query(By.directive(SummaryAmlComponent))?.nativeElement;

      expect(summaryAmlComponent).toBeTruthy();
    });
  });
});

