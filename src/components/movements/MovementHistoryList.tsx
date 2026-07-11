import type { Movement } from "../../api/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

export function MovementHistoryList({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-400">Sin movimientos registrados.</p>;
  }

  return (
    <ul className="max-h-56 space-y-1 overflow-y-auto">
      {movements.map((m) => (
        <li key={m._id} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
          <span className="text-slate-500">
            {formatDate(m.date)}
            {m.note ? ` · ${m.note}` : ""}
          </span>
          <span className={m.type === "in" ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>
            {m.type === "in" ? "+" : "−"}
            {m.qty}
          </span>
        </li>
      ))}
    </ul>
  );
}
