import { openDB, type IDBPDatabase } from 'idb'
import type { PublicBacktestResult, GenericStrategyConfigDTO } from '@/types/backtest'
import type { SignalFilterParams, SignalListResponse, SignalResponse } from '@/types/signal'

const DB_NAME = 'mystignal'
const DB_VERSION = 2
const STORE = 'public_backtests'
const STORE_SIGNALS = 'public_signals'

export interface PublicSignalParams {
  minConfidence: number
  compositeIndex: string
  entryTiming: string
}

interface StoredBacktest {
  workflowId: string
  result: PublicBacktestResult
  savedAt: number
  strategyConfig?: GenericStrategyConfigDTO
  signalParams?: PublicSignalParams
}

async function getDB(): Promise<IDBPDatabase | null> {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'workflowId' })
        }
        if (oldVersion < 2) {
          // Drop and recreate to ensure out-of-line key store (no keyPath)
          if (db.objectStoreNames.contains(STORE_SIGNALS)) {
            db.deleteObjectStore(STORE_SIGNALS)
          }
          db.createObjectStore(STORE_SIGNALS)
        }
      },
    })
  } catch (err) {
    console.warn('[idb] IndexedDB unavailable:', err)
    return null
  }
}

export async function savePublicBacktest(workflowId: string, result: PublicBacktestResult, strategyConfig?: GenericStrategyConfigDTO, signalParams?: PublicSignalParams): Promise<void> {
  const db = await getDB()
  if (!db) return
  await db.put(STORE, { workflowId, result, savedAt: Date.now(), strategyConfig, signalParams } satisfies StoredBacktest)
}

export async function getPublicBacktest(workflowId: string): Promise<PublicBacktestResult | undefined> {
  const db = await getDB()
  if (!db) return undefined
  const row: StoredBacktest | undefined = await db.get(STORE, workflowId)
  return row?.result
}

export interface PublicBacktestEntry {
  result: PublicBacktestResult
  strategyConfig?: GenericStrategyConfigDTO
  signalParams?: PublicSignalParams
}

export async function getPublicBacktestEntry(workflowId: string): Promise<PublicBacktestEntry | undefined> {
  const db = await getDB()
  if (!db) return undefined
  const row: StoredBacktest | undefined = await db.get(STORE, workflowId)
  if (!row) return undefined
  return { result: row.result, strategyConfig: row.strategyConfig, signalParams: row.signalParams }
}

export interface PublicBacktestSummary {
  workflowId: string
  savedAt: number
  startDate: string
  endDate: string
  roiPct: number
  winRatePct: number
  totalTrades: number
  maxDrawdownPct: number
  sharpeRatio: number
  strategyConfig?: GenericStrategyConfigDTO
  signalParams?: PublicSignalParams
}

export async function listPublicBacktests(): Promise<PublicBacktestSummary[]> {
  const db = await getDB()
  if (!db) return []
  const rows: StoredBacktest[] = await db.getAll(STORE)
  return rows.map(r => ({
    workflowId: r.workflowId,
    savedAt: r.savedAt,
    startDate: r.result.metadata.startDate,
    endDate: r.result.metadata.endDate,
    roiPct: r.result.aggregate.roiPct,
    winRatePct: r.result.aggregate.winRatePct,
    totalTrades: r.result.aggregate.totalTrades,
    maxDrawdownPct: r.result.aggregate.maxDrawdownPct,
    sharpeRatio: r.result.aggregate.sharpeRatio,
    strategyConfig: r.strategyConfig,
    signalParams: r.signalParams,
  }))
}

export async function deletePublicBacktest(workflowId: string): Promise<void> {
  const db = await getDB()
  if (!db) return
  await db.delete(STORE, workflowId)
}

export async function saveSignals(signals: SignalResponse[]): Promise<void> {
  const db = await getDB()
  if (!db) return
  await db.put(STORE_SIGNALS, signals, 'latest')
}

export async function listSignals(): Promise<SignalResponse[]> {
  const db = await getDB()
  if (!db) return []
  const row: SignalResponse[] | undefined = await db.get(STORE_SIGNALS, 'latest')
  return row ?? []
}

export async function listSignalsFiltered(params: SignalFilterParams): Promise<SignalListResponse> {
  const all = await listSignals()
  const filtered = all.filter(s =>
    (!params.symbol || s.symbol === params.symbol) &&
    (!params.type || s.type === params.type) &&
    (!params.status || s.status === params.status)
  )
  const page = params.page ?? 1
  const pageSize = Math.max(1, params.pageSize ?? 20)
  const data = filtered.slice((page - 1) * pageSize, page * pageSize)
  return {
    data,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize) || 1,
  }
}

export async function deleteAllSignals(): Promise<void> {
  const db = await getDB()
  if (!db) return
  await db.delete(STORE_SIGNALS, 'latest')
}
