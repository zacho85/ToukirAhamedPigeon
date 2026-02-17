export interface User {
  id: string;
  fullName: string;
  email: string;
  roles?: string[];
  [key: string]: any;
}

export interface LoginResponse {
  otp_required: any;
  email(email: any): unknown;
  userInfo(userInfo: any): { payload: any; type: "auth/setUser"; };
  user: User;
  accessToken: string;
  refreshTokenExpiry: string;
}

export interface RefreshResponse {
  user?: User;
  accessToken: string;
  refreshTokenExpiry: string;
}