import { Observable } from 'rxjs';

export abstract class PeAdsApi {
  abstract getCampaigns(): Observable<any[]>;

  abstract deleteCampaigns(campaignIds: string[]): void;
}
