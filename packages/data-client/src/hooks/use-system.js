import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
export function useHealthStatus(source) {
    return useQuery({
        queryKey: queryKeys.system.health(),
        queryFn: () => source.getHealth(),
        refetchInterval: 30000,
        staleTime: 15000,
    });
}
//# sourceMappingURL=use-system.js.map