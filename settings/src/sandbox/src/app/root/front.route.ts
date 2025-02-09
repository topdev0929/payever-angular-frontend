import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserBusinessInterface } from '../../../../modules/settings/src/services';
import { EnvironmentConfigService } from '../../../../modules/settings/src/services';

@Component({
  selector: 'peb-sandbox-root',
  templateUrl: './front.route.html',
  styleUrls: ['./front.route.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SandboxFrontRouteComponent implements OnInit {
  businessesList: Observable<UserBusinessInterface[]>;
  selectedBusiness: string;

  constructor(
    private configService: EnvironmentConfigService,
    private http: HttpClient) {}

  ngOnInit(): void {
    const config = this.configService.getBackendConfig();
    this.businessesList = this.http.get<UserBusinessInterface[]>(`${config.users}/api/business`);
  }
}
