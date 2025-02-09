import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LocaleService } from '../../services/locale/locale.service';
import { of, BehaviorSubject } from 'rxjs';
import { Component, DebugElement, Input } from '@angular/core';
import { LocalesDropdownComponent } from './locales-dropdown.component';
import { By } from '@angular/platform-browser';
import { mockComponent } from '../../../../test/src/helpers/component-test-helper';

describe('LocalesDropdownComponent', () => {

  @Component({
    selector: 'test-container',
    template: `
      <pe-locales-dropdown
        [dropUp]="dropUp">
      </pe-locales-dropdown>
    `
  })
  class TestContainerComponent {
    dropUp: boolean = false;
  }

  let testFixture: ComponentFixture<any>;
  let testComponent: TestContainerComponent;
  let testDebugElem: DebugElement;
  let component: LocalesDropdownComponent;
  let localeService: any;

  const locales: any = [
    {
      code: 'en'
    },
    {
      code: 'de'
    }
  ];
  const currentLocale: any = {
    code: 'de'
  };

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [
        TestContainerComponent,
        LocalesDropdownComponent,
        mockComponent({
          selector: 'pe-locale-flag',
          inputs: ['code']
        })
      ],
      providers: [
        {
          provide: LocaleService,
          useValue: {
            locales$: new BehaviorSubject<any[]>(locales),
            currentLocale$: new BehaviorSubject<any>(currentLocale),
            changeCurrentLocale: jasmine.createSpy()
          }
        }
      ]
    });

    localeService = TestBed.get(LocaleService);

    testFixture = TestBed.createComponent(TestContainerComponent);
    testComponent = testFixture.componentInstance;
    testDebugElem = testFixture.debugElement;
    component = testDebugElem.query(By.css('pe-locales-dropdown')).componentInstance;
  });

  it('should call methods and set locales', () => {
    testFixture.detectChanges();

    expect(component.locales).toBe(locales);
    expect(component.currentLocale).toBe(currentLocale);
  });

  it('should call changeLocale method', () => {
    testFixture.detectChanges();

    testDebugElem.query(By.css('.dropdown-item')).nativeElement.click();

    expect(localeService.changeCurrentLocale).toHaveBeenCalledWith(locales[0].code);
  });

  it('should display only one pe-locale-flag if dropUp is true', () => {
    testComponent.dropUp = true;
    testFixture.detectChanges();

    const flags = testDebugElem.queryAll(By.css('pe-locale-flag'));

    expect(flags.length).toBe(1);
  });
});
