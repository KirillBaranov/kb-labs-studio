import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../query-keys';
export function useReleasePreview(source, range) {
    return useQuery({
        queryKey: queryKeys.release.preview(),
        queryFn: () => source.getPreview(range),
        enabled: !!range,
        staleTime: 60000,
    });
}
export function useRunRelease(source) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (confirm) => source.runRelease(confirm),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.release.preview() });
        },
    });
}
//# sourceMappingURL=use-release.js.map