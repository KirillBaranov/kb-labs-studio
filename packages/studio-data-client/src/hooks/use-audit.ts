import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuditDataSource } from '../sources/audit-source';
import { queryKeys } from '../query-keys';

export function useAuditSummary(source: AuditDataSource) {
  return useQuery({
    queryKey: queryKeys.audit.summary(),
    queryFn: () => source.getSummary(),
    staleTime: 30000,
  });
}

export function useAuditPackage(name: string, source: AuditDataSource) {
  return useQuery({
    queryKey: queryKeys.audit.pkg(name),
    queryFn: () => source.getPackageReport(name),
    enabled: !!name,
    staleTime: 60000,
  });
}

export function useRunAudit(source: AuditDataSource) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scope?: string[]) => source.runAudit(scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.audit.summary() });
    },
  });
}

