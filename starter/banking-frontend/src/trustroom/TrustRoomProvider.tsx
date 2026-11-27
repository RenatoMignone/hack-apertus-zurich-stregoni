/**
 * Shared TrustRoom state: panel open/closed, what the current page has selected, and a channel
 * to broadcast host events (e.g. dashboard-changed) to all mounted TrustRoom iframes.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { HostMessageType, Selection } from "./protocol";

type Listener = (type: HostMessageType, payload: object) => void;

interface TrustRoomState {
  panelOpen: boolean;
  selection: Selection;
}

/** Setters and the broadcast channel never change, so components that only use them don't re-render. */
interface TrustRoomActions {
  setPanelOpen: (open: boolean) => void;
  setSelection: (selection: Selection) => void;
  broadcast: Listener;
  subscribe: (listener: Listener) => () => void;
}

const StateContext = createContext<TrustRoomState | null>(null);
const ActionsContext = createContext<TrustRoomActions | null>(null);

export function TrustRoomProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selection, setSelection] = useState<Selection>({});
  const listeners = useRef(new Set<Listener>());

  const actions = useMemo<TrustRoomActions>(
    () => ({
      setPanelOpen,
      setSelection,
      broadcast: (type, payload) => listeners.current.forEach((l) => l(type, payload)),
      subscribe: (listener) => {
        listeners.current.add(listener);
        return () => void listeners.current.delete(listener);
      },
    }),
    [],
  );
  const state = useMemo(() => ({ panelOpen, selection }), [panelOpen, selection]);

  return (
    <ActionsContext.Provider value={actions}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </ActionsContext.Provider>
  );
}

/** Stable setters and broadcast channel; using only these doesn't re-render on panel or selection changes. */
export function useTrustRoomActions(): TrustRoomActions {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("useTrustRoomActions must be used inside <TrustRoomProvider>");
  return actions;
}

/** Panel state and page selection plus the actions; re-renders whenever the state changes. */
export function useTrustRoom(): TrustRoomState & TrustRoomActions {
  const state = useContext(StateContext);
  const actions = useTrustRoomActions();
  if (!state) throw new Error("useTrustRoom must be used inside <TrustRoomProvider>");
  return { ...state, ...actions };
}

/**
 * Pages call this to tell the TrustRoom what the customer is looking at, e.g.
 * `useTrustRoomSelection({ title: account.name, account })`. Cleared when the page unmounts.
 */
export function useTrustRoomSelection(selection: Selection) {
  const { setSelection } = useTrustRoomActions();
  const key = JSON.stringify(selection);
  useEffect(() => {
    setSelection(JSON.parse(key));
    return () => setSelection({});
  }, [key, setSelection]);
}
