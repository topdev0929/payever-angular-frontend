export interface LoginDto {
  email: string;
  plainPassword: string;
  language?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
