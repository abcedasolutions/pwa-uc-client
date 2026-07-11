import { useSyncStatus } from "../../hooks/useSyncStatus";
import { runSync } from "../../db/syncEngine";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export function SyncStatusIndicator() {
  const { pending, syncing } = useSyncStatus();
  const online = useOnlineStatus();

  let label = "Sincronizado";
  if (syncing) label = "Sincronizando…";
  else if (pending > 0) label = `${pending} cambio(s) pendiente(s)`;

  return (
    <button
      type="button"
      onClick={() => runSync()}
      disabled={!online || syncing}
      className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 disabled:opacity-60"
      title="Sincronizar ahora"
    >
      <i className={`fa fa-refresh ${syncing ? "fa-spin" : ""}`} aria-hidden="true" />
      {label}
    </button>
  );
}
