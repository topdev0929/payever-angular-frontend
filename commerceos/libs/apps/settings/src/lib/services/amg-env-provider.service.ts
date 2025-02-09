import { LazyMapsAPILoaderConfigLiteral } from "@agm/core";
import { Injectable } from "@angular/core";

import { EnvironmentConfigService } from "./environment-config.service";

@Injectable({
  providedIn: "root",
})
export class AmgEnvService implements LazyMapsAPILoaderConfigLiteral {
  public apiKey: string;
  public libraries: string[];


  constructor(private readonly config: EnvironmentConfigService) {
    this.apiKey = this.config.getConfig().config.googleMapsApiKey;
    this.libraries = ["places"];
  }
}
