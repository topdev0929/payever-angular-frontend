export interface RiskSessionInterface {
  riskSessionId: string;
  provider: RiskSessionProvider;
  orgId: string;
}

export interface RiskSessionProvider {
  name: string;
  script?: string;
}
