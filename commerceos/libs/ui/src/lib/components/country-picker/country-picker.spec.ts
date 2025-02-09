import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { countries } from 'country-data-list';

import { PebCountryPickerComponent } from './country-picker';

describe('PebCountryPickerComponent', () => {

  let fixture: ComponentFixture<PebCountryPickerComponent>;
  let component: PebCountryPickerComponent;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        MatAutocompleteModule,
      ],
      declarations: [
        PebCountryPickerComponent,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebCountryPickerComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set countries on init', () => {

    // w/o externalCountries
    component.ngOnInit();

    expect(component[`countries`]).toEqual(countries.all.map(c => c.name));

    // w/ externalCountries
    component.externalCountries = ['test.country'];
    component.ngOnInit();

    expect(component[`countries`]).toEqual(['test.country']);

  });

  it('should handle on key', () => {

    const customSpy = spyOn<any>(component, 'customFilter').and.callThrough();
    const event = {
      target: {
        value: 'ger',
      },
    };

    component.onKey(event);

    expect(customSpy).toHaveBeenCalledWith(event.target.value);
    expect(component.filteredOptions).toEqual([
      'German Democratic Republic',
      'Germany',
      'Algeria',
      'Niger',
      'Nigeria',
    ]);

  });

  it('should handle remove country', () => {

    const emitSpy = spyOn(component, 'emitChanges');

    component.addedCountries = [
      'USA',
      'Germany',
      'Russia',
    ];

    component.onRemoveCountry(null, 0);

    expect(component.addedCountries).toEqual(['Germany', 'Russia']);
    expect(emitSpy).toHaveBeenCalled();

  });

});
