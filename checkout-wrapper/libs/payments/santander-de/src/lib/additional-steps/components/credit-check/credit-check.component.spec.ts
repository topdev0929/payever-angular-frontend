import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { AdditionalStepsModule } from '../../additional-steps.module';
import { INPUTS } from '../../injection-token.constants';

import { CreditCheckComponent } from './credit-check.component';

describe('CreditCheckComponent', () => {
  let component: CreditCheckComponent;
  let fixture: ComponentFixture<CreditCheckComponent>;
  const next = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AdditionalStepsModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: INPUTS,
          useValue: {
            next,
            skip: jest.fn(),
          },
        },
      ],
      declarations: [
        CreditCheckComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditCheckComponent);
    component = fixture.componentInstance;
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
    it('should emit next', (done) => {
      component.ngOnInit();
      setTimeout(() => {
        expect(next).toHaveBeenCalled();
        done();
      }, 0);
    });
  });
});
