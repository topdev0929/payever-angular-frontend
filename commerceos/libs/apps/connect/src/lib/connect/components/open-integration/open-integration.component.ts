import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'connect-open-integration',
  template: `
  <connect-embed-open-integration [backPath]="backPath"
    [integration]="integrationName"
  ></connect-embed-open-integration>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectOpenIntegrationComponent {

  get backPath() : string {
    return this.activatedRoute.snapshot.queryParams.backPath;
  }

  get integrationName(): string {
    return this.activatedRoute.snapshot.params.integrationName;
  }

  constructor(
    private activatedRoute: ActivatedRoute
  ) {
  }
}
