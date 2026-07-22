import { useDashboard } from "../hooks/useDashboard";

import { KpiGrid } from "../components/dashboard/KpiGrid";
import { CategoryChart } from "../components/dashboard/CategoryChart";
import { LowStockPanel } from "../components/dashboard/LowStockPanel";

const today = new Intl.DateTimeFormat("es-PE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());
export function DashboardPage() {
  const dashboard = useDashboard();

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Dashboard
                </h1>

                <p className="mt-1 capitalize text-sm text-slate-500">
                {today}
                </p>

                <p className="mt-3 text-slate-600">
                Bienvenido al sistema de gestión de inventario.
                </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                Resumen
                </p>

                <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-8">
                    <span className="text-slate-500">Productos</span>
                    <span className="font-semibold">{dashboard.kpis.totalProducts}</span>
                </div>

                <div className="flex justify-between gap-8">
                    <span className="text-slate-500">Inventarios</span>
                    <span className="font-semibold">{dashboard.kpis.totalInventories}</span>
                </div>

                <div className="flex justify-between gap-8">
                    <span className="text-slate-500">Conteos</span>
                    <span className="font-semibold">{dashboard.kpis.totalCountItems}</span>
                </div>
                </div>
            </div>
            </div>

      <KpiGrid kpis={dashboard.kpis} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <CategoryChart
            categories={dashboard.categories}
            />
        </div>

        <LowStockPanel
            products={dashboard.lowStock}
        />
        </div>
    </div>
  );
}