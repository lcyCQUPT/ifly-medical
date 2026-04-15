import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AISettings, AISettingsUpdateInput } from '@ifly-medical/shared';
import { aiSettingsUpdateSchema } from '@ifly-medical/shared';
import http from './http';

async function fetchAISettings(): Promise<AISettings> {
  const res = await http.get<AISettings>('/api/ai-settings');
  return res.data;
}

async function updateAISettings(data: AISettingsUpdateInput): Promise<AISettings> {
  const res = await http.put<AISettings>('/api/ai-settings', aiSettingsUpdateSchema.parse(data));
  return res.data;
}

export function useAISettings() {
  return useQuery({
    queryKey: ['ai-settings'],
    queryFn: fetchAISettings,
    staleTime: 60 * 1000,
  });
}

export function useUpdateAISettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAISettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
    },
  });
}
