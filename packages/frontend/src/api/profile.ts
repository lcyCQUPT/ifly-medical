import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Profile } from '@ifly-medical/shared';

export interface ProfileInput {
  name: string;
  gender?: string | null;
  birthDate?: string | null;
  bloodType?: string | null;
  height?: number | null;
  weight?: number | null;
  allergies?: string | null;
  chronicDiseases?: string | null;
}

async function fetchProfile(): Promise<Profile | null> {
  try {
    const res = await axios.get<Profile>('/api/profile');
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
      axios.put<Profile>('/api/profile', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
