import { Component, ViewChild, TemplateRef } from '@angular/core';
import { DocContentSettingsInterface } from '../../../modules/example-viewer';

@Component({
  selector: 'doc-docker',
  templateUrl: 'docker-doc.component.html'
})
export class DockerDocComponent {

  settings: DocContentSettingsInterface;

  @ViewChild('exampleDefault', { static: true }) exampleDefault: TemplateRef<any>;

  ngOnInit(): void {
    this.settings = {
      title: 'DockerComponent',
      import: 'import { DockerModule } from \'@pe/ng-kit/modules/dialog\';',
      sourcePath: 'docker/src/components/docker.component',
      examples: [
        {
          title: 'Default',
          tsExample: require('!!raw-loader!./examples/docker-example/docker-example.component.ts'),
          htmlExample: require('!!raw-loader!./examples/docker-example/docker-example.component.html'),
          content: this.exampleDefault
        }
      ]
    };
  }

}
