import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Medication,
  MedicationCreateInput,
  MedicationUpdateInput,
  PaginatedMedications,
} from '@ifly-medical/shared';
import { medicationCreateSchema, medicationUpdateSchema } from '@ifly-medical/shared';
import http from './http';

export type MedicationInput = MedicationCreateInput;

async function fetchMedications(page: number, limit: number, isActive?: boolean): Promise<PaginatedMedications> {
  const params = isActive !== undefined ? { page, limit, isActive } : { page, limit };
  const res = await http.get<PaginatedMedications>('/api/medications', { params });
  return res.data;
}

export function useMedications(page: number, limit: number, isActive?: boolean) {
  return useQuery({
    queryKey: ['medications', page, limit, isActive],
    queryFn: () => fetchMedications(page, limit, isActive),
    staleTime: 60 * 1000,
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MedicationInput) =>
      http.post<Medication>('/api/medications', medicationCreateSchema.parse(data)).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useUpdateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MedicationUpdateInput> }) =>
      http.put<Medication>(`/api/medications/${id}`, medicationUpdateSchema.parse(data)).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      http.delete<{ success: boolean }>(`/api/medications/${id}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });
}
