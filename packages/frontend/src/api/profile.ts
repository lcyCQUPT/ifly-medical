import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@ifly-medical/shared';
import { profileUpsertSchema, type ProfileUpsertInput } from '@ifly-medical/shared';
import http from './http';

export type ProfileInput = ProfileUpsertInput;

async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await http.get<Profile>('/api/profile');
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileInput) =>
      http.put<Profile>('/api/profile', profileUpsertSchema.parse(data)).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
