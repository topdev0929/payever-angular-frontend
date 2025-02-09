import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'doc-slider-default-example',
  templateUrl: 'slider-default-example.component.html'
})
export class SliderDefaultExampleDocComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      sliderValue: 0.3
    });
  }

  onSubmit() {
    
  }
}
