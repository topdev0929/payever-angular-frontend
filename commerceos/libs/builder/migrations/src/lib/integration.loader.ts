export class IntegrationsLoader {
  private cache: any;

  environment: any;

  get integrations() {
    return (async () => {
      if (!this.cache) {
        const res = await fetch(`${this.environment.api}/api/v2/integration`);
        this.cache = await res.json();
      }

      return this.cache;
    })();
  }
}

export const loader = new IntegrationsLoader();
