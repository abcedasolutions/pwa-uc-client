import { useOnlineStatus } from "../../hooks/useOnlineStatus";

export function OnlineBadge() {
  const online = useOnlineStatus();
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        online ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {online ? "En línea" : "Sin conexión (modo offline)"}
    </span>
  );
}
