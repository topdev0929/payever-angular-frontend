import { TestBed, ComponentFixture } from '@angular/core/testing';
import { CounterModule } from './counter.module';
import { Component } from '@angular/core';

describe('CounterModule', () => {
  it('should provide components', async () => {
    @Component({
      selector: 'test-counter-component',
      template: `
        <pe-counter></pe-counter>
      `
    })
    class TestCounterComponent {}

    TestBed.configureTestingModule({
      declarations: [TestCounterComponent],
      imports: [CounterModule],
    });

    let component: TestCounterComponent;
    try {
      await TestBed.compileComponents();
      const fixture: ComponentFixture<TestCounterComponent> = TestBed.createComponent(TestCounterComponent);
      expect(fixture).toBeTruthy();
      component = fixture.componentInstance;
    } catch (e) {
      expect(e).toBeFalsy('Should not produce error');
    }
    expect(component).toBeTruthy();
    expect(component instanceof TestCounterComponent).toBe(true);
  });
});
