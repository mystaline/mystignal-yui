import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearAllSignals } from '@/lib/api/signals'
import { queryKeys } from '@/lib/query-keys'

export function useClearSignals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearAllSignals,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.signals.all })
    },
  })
}
