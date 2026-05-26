import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useJobPoller } from "@/hooks/useJobPoller";
import { getBacktestJob } from "@/lib/api/backtest";
import { savePublicBacktest } from "@/lib/idb";
import { queryKeys } from "@/lib/query-keys";
import type { PublicBacktestResult, PublicJobStatus, GenericStrategyConfigDTO } from "@/types/backtest";
import type { PublicSignalParams } from "@/lib/idb";

const SESSION_KEY = "msig_public_wf";

export type BacktestJobPhase =
  | "idle"
  | "queued"
  | "fetching"
  | "simulating"
  | "done"
  | "error"
  | "expired";

export interface PublicBacktestState {
  phase: BacktestJobPhase;
  label: string;
  workflowId: string | null;
  result: PublicBacktestResult | null;
  savedToBrowser: boolean;
  strategyConfig: GenericStrategyConfigDTO | null;
  signalParams: PublicSignalParams | null;
}

interface PublicBacktestContextValue {
  state: PublicBacktestState;
  start: (workflowId: string, strategyConfig?: GenericStrategyConfigDTO, signalParams?: PublicSignalParams) => void;
  dismiss: () => void;
}

const IDLE: PublicBacktestState = {
  phase: "idle",
  label: "",
  workflowId: null,
  result: null,
  savedToBrowser: false,
  strategyConfig: null,
  signalParams: null,
};

const TERMINAL_PHASES: BacktestJobPhase[] = [
  "idle",
  "done",
  "error",
  "expired",
];

const PublicBacktestContext = createContext<PublicBacktestContextValue | null>(
  null,
);

export function PublicBacktestProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PublicBacktestState>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved)
      return {
        phase: "queued",
        label: "Queued",
        workflowId: saved,
        result: null,
        savedToBrowser: false,
        strategyConfig: null,
        signalParams: null,
      };
    return IDLE;
  });

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimer.current !== null) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  useEffect(() => clearDismissTimer, [clearDismissTimer]);

  const start = useCallback(
    (workflowId: string, strategyConfig?: GenericStrategyConfigDTO, signalParams?: PublicSignalParams) => {
      clearDismissTimer();
      sessionStorage.setItem(SESSION_KEY, workflowId);
      setState({
        phase: "queued",
        label: "Queued",
        workflowId,
        result: null,
        savedToBrowser: false,
        strategyConfig: strategyConfig ?? null,
        signalParams: signalParams ?? null,
      });
    },
    [clearDismissTimer],
  );

  const dismiss = useCallback(() => {
    clearDismissTimer();
    sessionStorage.removeItem(SESSION_KEY);
    setState(IDLE);
  }, [clearDismissTimer]);

  // Pass null to poller in terminal states so it stops polling,
  // but keep workflowId in state so the page can match results.
  const pollWorkflowId = TERMINAL_PHASES.includes(state.phase)
    ? null
    : state.workflowId;

  useJobPoller<PublicBacktestResult>(pollWorkflowId, {
    fetcher: getBacktestJob,
    onPhase: (phase, label) => {
      setState((s) => ({ ...s, phase: phase as BacktestJobPhase, label }));
    },
    onDone: (result, wfId) => {
      sessionStorage.removeItem(SESSION_KEY);
      // Transition to 'done' synchronously so the poller stops immediately via pollWorkflowId.
      // savedToBrowser starts false and is updated once the async IDB write resolves.
      setState((s) => ({
        ...s,
        phase: "done",
        label: "Done",
        result,
        savedToBrowser: false,
      }));
      clearDismissTimer();
      dismissTimer.current = setTimeout(() => {
        dismissTimer.current = null;
        setState(IDLE);
      }, 6000);
      savePublicBacktest(wfId, result, state.strategyConfig ?? undefined, state.signalParams ?? undefined)
        .then(() => {
          setState((s) =>
            s.phase === "done" ? { ...s, savedToBrowser: true } : s,
          );
          queryClient.invalidateQueries({ queryKey: queryKeys.publicBacktests.list });
        })
        .catch((err) =>
          console.warn(
            "[PublicBacktest] Failed to persist result to IndexedDB:",
            err,
          ),
        );
    },
    onError: (message) => {
      sessionStorage.removeItem(SESSION_KEY);
      setState((s) => ({ ...s, phase: "error", label: message }));
      clearDismissTimer();
      dismissTimer.current = setTimeout(() => {
        dismissTimer.current = null;
        setState(IDLE);
      }, 6000);
    },
  });

  return (
    <PublicBacktestContext.Provider value={{ state, start, dismiss }}>
      {children}
    </PublicBacktestContext.Provider>
  );
}

export function usePublicBacktest() {
  const ctx = useContext(PublicBacktestContext);
  if (!ctx)
    throw new Error(
      "usePublicBacktest must be used inside PublicBacktestProvider",
    );
  return ctx;
}

// Silence unused import warning — PublicJobStatus is re-exported for consumers
export type { PublicJobStatus };
