import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clearAllSignals } from '@/lib/api/signals'
import { deleteAllSignals } from '@/lib/idb'
import { getLiveKey } from '@/lib/api/client'
import { queryKeys } from '@/lib/query-keys'

export function useClearSignals() {
  const queryClient = useQueryClient()
  const authed = !!getLiveKey()

  return useMutation({
    mutationFn: authed ? clearAllSignals : deleteAllSignals,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.signals.all })
    },
  })
}
