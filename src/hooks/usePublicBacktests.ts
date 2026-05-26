import { useQuery } from '@tanstack/react-query'
import { listPublicBacktests } from '@/lib/idb'
import { queryKeys } from '@/lib/query-keys'

export function usePublicBacktests() {
  return useQuery({
    queryKey: queryKeys.publicBacktests.list,
    queryFn: async () => {
      const rows = await listPublicBacktests()
      return rows.sort((a, b) => b.savedAt - a.savedAt)
    },
  })
}
