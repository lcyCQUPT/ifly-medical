export interface AuthUser {
  userId: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
