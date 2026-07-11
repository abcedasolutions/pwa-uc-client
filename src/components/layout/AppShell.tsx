import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { OnlineBadge } from "./OnlineBadge";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { InstallButton } from "./InstallButton";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-svh bg-blue-50">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <i className="fa fa-archive" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-semibold text-slate-900">Inventario</h1>
            {user && <p className="text-xs text-slate-500">{user.business.name}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <OnlineBadge />
          <SyncStatusIndicator />
          <InstallButton />
          {user && (
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
            >
              Salir
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
    </div>
  );
}
