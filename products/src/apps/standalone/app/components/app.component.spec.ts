import { ElementRef, TestabilityRegistry } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

export class MockElementRef extends ElementRef {
    constructor() { super(null); }
}

describe('AppComponent', () => {

    let testabilityRegistrySpy: TestabilityRegistry;
    let component: AppComponent;

    beforeEach(() => {
        testabilityRegistrySpy = jasmine.createSpyObj<TestabilityRegistry>(
            'TestabilityRegistry', [
                'unregisterApplication',
        ]);

        TestBed.configureTestingModule({
            providers: [
                AppComponent,
                { provide: TestabilityRegistry, useValue: testabilityRegistrySpy },
                { provide: ElementRef, useClass: MockElementRef },
            ],
        });

        component = TestBed.get(AppComponent);
    });

    it('should be defined', () => {
        expect(component).toBeDefined();
    });

    it('should unregister application on destroy', () => {
        component.ngOnDestroy();
        /* tslint:disable:no-unbound-method */
        expect(testabilityRegistrySpy.unregisterApplication).toHaveBeenCalled();
    });
});
