import { openDB, type IDBPDatabase } from 'idb'
import type { PublicBacktestResult } from '@/types/backtest'

const DB_NAME = 'mystignal'
const DB_VERSION = 1
const STORE = 'public_backtests'

interface StoredBacktest {
  workflowId: string
  result: PublicBacktestResult
  savedAt: number
}

async function getDB(): Promise<IDBPDatabase | null> {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'workflowId' })
        }
      },
    })
  } catch (err) {
    console.warn('[idb] IndexedDB unavailable:', err)
    return null
  }
}

export async function savePublicBacktest(workflowId: string, result: PublicBacktestResult): Promise<void> {
  const db = await getDB()
  if (!db) return
  await db.put(STORE, { workflowId, result, savedAt: Date.now() } satisfies StoredBacktest)
}

export async function getPublicBacktest(workflowId: string): Promise<PublicBacktestResult | undefined> {
  const db = await getDB()
  if (!db) return undefined
  const row: StoredBacktest | undefined = await db.get(STORE, workflowId)
  return row?.result
}

export async function listPublicBacktests(): Promise<{ workflowId: string; savedAt: number }[]> {
  const db = await getDB()
  if (!db) return []
  const rows: StoredBacktest[] = await db.getAll(STORE)
  return rows.map(r => ({ workflowId: r.workflowId, savedAt: r.savedAt }))
}

export async function deletePublicBacktest(workflowId: string): Promise<void> {
  const db = await getDB()
  if (!db) return
  await db.delete(STORE, workflowId)
}
