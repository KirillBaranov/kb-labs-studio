import { useQuery } from '@tanstack/react-query';
import type { SystemDataSource } from '../sources/system-source';
import type { HealthStatus } from '../contracts/system';
import { queryKeys } from '../query-keys';

export function useHealthStatus(source: SystemDataSource) {
  return useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: () => source.getHealth(),
    refetchInterval: 30000,
    staleTime: 15000,
  });
}

