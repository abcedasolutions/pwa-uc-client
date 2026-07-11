import { useEffect, useState } from "react";
import { getOutbox } from "../db/indexedDb";
import { onSyncChange, isSyncing } from "../db/syncEngine";

export function useSyncStatus() {
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(isSyncing());

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const outbox = await getOutbox();
      if (!cancelled) setPending(outbox.length);
      setSyncing(isSyncing());
    };
    refresh();
    const unsubscribe = onSyncChange(refresh);
    const interval = setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return { pending, syncing };
}
