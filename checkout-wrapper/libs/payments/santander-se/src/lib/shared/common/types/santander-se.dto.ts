export interface AuthenticationInitializationResponse {
  transactionId: string;
}

export interface AuthenticationStatusResponse {
  signingStatus: AuthenticationSigningStatus;
}

export class AuthenticationError {
  constructor(
    public code: 'signing_timeout' | 'invalid_signing_status',
    public message: string,
  ) {}
}

export enum AuthenticationSigningStatus {
  Completed = 'Completed',
  Created = 'Created',
  Expired = 'Expired',
}
