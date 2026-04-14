import { createContext } from 'react';
import type { AuthUser } from '@ifly-medical/shared';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, nextUser: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
