import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ReleaseDataSource } from '../sources/release-source';
import { queryKeys } from '../query-keys';

export function useReleasePreview(source: ReleaseDataSource, range?: { from: string; to: string }) {
  return useQuery({
    queryKey: queryKeys.release.preview(),
    queryFn: () => source.getPreview(range),
    enabled: !!range,
    staleTime: 60000,
  });
}

export function useRunRelease(source: ReleaseDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (confirm?: boolean) => source.runRelease(confirm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.release.preview() });
    },
  });
}

