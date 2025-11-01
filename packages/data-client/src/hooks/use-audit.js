import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
export function useAuditSummary(source) {
    return useQuery({
        queryKey: queryKeys.audit.summary(),
        queryFn: () => source.getSummary(),
        staleTime: 30000,
    });
}
export function useAuditPackage(name, source) {
    return useQuery({
        queryKey: queryKeys.audit.pkg(name),
        queryFn: () => source.getPackageReport(name),
        enabled: !!name,
        staleTime: 60000,
    });
}
export function useRunAudit(source) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (scope) => source.runAudit(scope),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.audit.summary() });
        },
    });
}
//# sourceMappingURL=use-audit.js.map