import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'doc-slide-toggle-default-example',
  templateUrl: 'slide-toggle-default-example.component.html'
})
export class SlideToggleDefaultExampleDocComponent implements OnInit {

  form: FormGroup;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      slidetoggleFirst: true,
      slidetoggleSecond: false
    });
  }

  onSubmit() {
    
  }
}
