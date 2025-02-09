import {GoogleAutocompleteDirective} from './google-autocomplete.directive';
import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AddressModule} from '../address.module';
import {Subject} from 'rxjs';
import {GoogleAutocompleteService} from '../services';
import {AddressInterface} from '../interfaces';

@Component({
  template: `<input (address)="address.emit($event)" #input type="text" pe-google-autocomplete>`
})
class GoogleAutocompleteDirectiveTestComponent {
  @Output() address: EventEmitter<AddressInterface> = new EventEmitter<AddressInterface>();
  @ViewChild('input', { static: true }) public inputRef: ElementRef;
}

describe('GoogleAutocompleteDirective', () => {
  let component: GoogleAutocompleteDirectiveTestComponent;
  let fixture: ComponentFixture<GoogleAutocompleteDirectiveTestComponent>;
  let serviceInitSubject$ = new Subject();
  const autoCompleteListener = {
    constructed$: new Subject<GoogleAutoComplete>(),
    listenerAdded$: new Subject<{ event: string, listener: Function }>(),
    domListenerAdded$: new Subject<{ element: HTMLElement, event: string, listener: Function }>(),
  };

  const getPlaceMock: { address_components: any[] } = {address_components: []};

  class GoogleAutoComplete {
    inputElem: HTMLElement;
    types: { types: string[] };
    places: [] = [];

    private notifier$ = autoCompleteListener;

    constructor(inputElem: HTMLElement, types: { types: string[] }) {
      this.inputElem = inputElem;
      this.types = types;
      this.notifier$.constructed$.next(this);
    }

    addListener(event: string, listener: Function) {
      this.notifier$.listenerAdded$.next({event, listener});
    }

    getPlace() {
      return getPlaceMock;
    }
  }

  const windowMock = {
    google: {
      maps: {
        places: {Autocomplete: GoogleAutoComplete},
        event: {
          addDomListener: (element: HTMLElement, event: string, listener: Function) => {
            autoCompleteListener.domListenerAdded$.next({element, event, listener});
          }
        }
      },
    },
  };

  beforeEach(() => {
    serviceInitSubject$ = new Subject();
    TestBed.configureTestingModule({
      declarations: [GoogleAutocompleteDirectiveTestComponent],
      imports: [AddressModule],
      providers: [
        {
          provide: 'Window',
          useValue: windowMock,
        },
        {
          provide: GoogleAutocompleteService,
          useValue: {
            onInit: serviceInitSubject$
          },
        },
      ]
    });
    fixture = TestBed.createComponent(GoogleAutocompleteDirectiveTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should construct google autocomplete and bind events', () => {
    let instance: GoogleAutoComplete = null;
    let eventBinding: { event: string, listener: Function } = null;
    let domListenBinding: { element: HTMLElement, event: string, listener: Function } = null;
    autoCompleteListener.constructed$.subscribe(data => instance = data);
    autoCompleteListener.listenerAdded$.subscribe(data => eventBinding = data);
    autoCompleteListener.domListenerAdded$.subscribe(data => domListenBinding = data);
    serviceInitSubject$.complete();
    expect(instance).toBeTruthy();
    expect(instance.inputElem).toBe(component.inputRef.nativeElement);
    expect(instance.types).toEqual({types: ['address']});
    expect(eventBinding.event).toBe('place_changed');
    expect(domListenBinding.element).toBe(component.inputRef.nativeElement);
    expect(domListenBinding.event).toBe('keydown');
  });

  it('should prevent default of event bind to domListenBinding of google', () => {
    let domListenBinding: { element: HTMLElement, event: string, listener: Function } = null;

    autoCompleteListener.domListenerAdded$.subscribe(data => domListenBinding = data);
    serviceInitSubject$.complete();
    let preventedEnter = false;
    let preventedAnyKey = false;
    domListenBinding.listener({keyCode: 13, preventDefault: () => preventedEnter = true});
    domListenBinding.listener({keyCode: 10, preventDefault: () => preventedAnyKey = true});
    expect(preventedEnter).toBeTruthy();
    expect(preventedAnyKey).toBeFalsy();
  });

  it('bind to autocomplete function emit address', () => {
    let eventBinding: { event: string, listener: Function } = null;
    autoCompleteListener.listenerAdded$.subscribe(data => eventBinding = data);
    serviceInitSubject$.complete();
    let emitted: AddressInterface = null;

    component.address.subscribe((data: AddressInterface) => emitted = data);
    getPlaceMock.address_components = [
      {
        long_name: 'Street',
        short_name: '',
        types: ['route'],
      },
      {
        long_name: 'StreetNumber',
        short_name: '',
        types: ['street_number'],
      },
      {
        long_name: '',
        short_name: 'Germany',
        types: ['country'],
      },
      {
        long_name: 'City',
        short_name: '',
        types: ['locality'],
      },
      {
        long_name: 'ZipCode',
        short_name: '',
        types: ['postal_code'],
      },
    ];
    eventBinding.listener();
    expect(emitted).toEqual({
      country: 'Germany',
      city: 'City',
      zip_code: 'ZipCode',
      street: 'Street StreetNumber',
      street_name: 'Street',
      street_number: ' StreetNumber'
    });
  });
});
