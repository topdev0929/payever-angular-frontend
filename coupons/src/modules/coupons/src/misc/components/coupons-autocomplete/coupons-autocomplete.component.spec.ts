import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { EnvService } from '@pe/common';
import { PeCouponsAutocompleteComponent } from './coupons-autocomplete.component';

describe('PeCouponsAutocompleteComponent', () => {

  let fixture: ComponentFixture<PeCouponsAutocompleteComponent>;
  let component: PeCouponsAutocompleteComponent;
  let envService: jasmine.SpyObj<EnvService>;

  beforeEach(async(() => {

    const envServiceMock = {
      businessData: null,
    };

    TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [PeCouponsAutocompleteComponent],
      providers: [
        { provide: EnvService, useValue: envServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsAutocompleteComponent);
      component = fixture.componentInstance;

      envService = TestBed.inject(EnvService);

      component.items = [];

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set theme on construct', () => {

    /**
     * envService.businessData is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envService.businessData = { themeSettings: null };

    fixture = TestBed.createComponent(PeCouponsAutocompleteComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envService.businessData.themeSettings = { theme: 'light' };

    fixture = TestBed.createComponent(PeCouponsAutocompleteComponent);
    component = fixture.componentInstance;

    expect(component.theme).toEqual('light');

  });

  it('should set filtered items on init', () => {

    const filtered = [{
      title: 'Title',
      value: 'test',
    }];
    const filterSpy = spyOn<any>(component, 'filter').and.returnValue(filtered);

    component.ngOnInit();
    component.filteredItems.subscribe(items => expect(items).toEqual(filtered));
    component.formControl.patchValue('test');

    expect(filterSpy).toHaveBeenCalledWith('test');

  });

  it('should handle option selected', () => {

    const item = {
      title: 'Title',
      value: 'test',
    };
    const blurSpy = spyOn(component.elementRef.nativeElement, 'blur');
    const patchSpy = spyOn(component.formControl, 'patchValue');
    const emitSpy = spyOn(component.onSelected, 'emit');

    component.optionSelected(item);

    expect(blurSpy).toHaveBeenCalled();
    expect(patchSpy).toHaveBeenCalledWith('');
    expect(emitSpy).toHaveBeenCalledWith(item);

  });

  it('should filter', () => {

    const items = [
      { title: 'James Bond' },
      { title: 'Batman' },
    ];
    const normalizeSpy = spyOn<any>(component, 'normalizeValue').and.callThrough();
    let value: any = 'Bat m';

    component.items = items as any;

    /**
     * typeof argument value is string
     */
    expect(component[`filter`](value)).toEqual([items[1]] as any);
    expect(normalizeSpy).toHaveBeenCalledWith(value);

    /**
     * typeof argument value is object
     */
    value = { title: 'Jam' };

    expect(component[`filter`](value)).toEqual([items[0]] as any);
    expect(normalizeSpy).toHaveBeenCalledWith(value.title);

  });

  it('should track option', () => {

    const option = {
      title: 'Title',
      value: 'test',
    };

    expect(component.trackOption(0, option)).toEqual(option);

  });

});
