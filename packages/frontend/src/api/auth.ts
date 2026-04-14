import { useMutation, useQuery } from '@tanstack/react-query';
import {
  authCredentialsSchema,
  type AuthCredentialsInput,
  type AuthResponse,
  type AuthUser,
} from '@ifly-medical/shared';
import http from './http';

async function login(payload: AuthCredentialsInput): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>('/api/auth/login', authCredentialsSchema.parse(payload));
  return response.data;
}

async function register(payload: AuthCredentialsInput): Promise<AuthResponse> {
  const response = await http.post<AuthResponse>('/api/auth/register', authCredentialsSchema.parse(payload));
  return response.data;
}

async function fetchMe(): Promise<AuthUser> {
  const response = await http.get<AuthUser>('/api/auth/me');
  return response.data;
}

export function useLogin() {
  return useMutation({
    mutationFn: login,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: register,
  });
}

export function useMe(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled,
    retry: false,
  });
}
