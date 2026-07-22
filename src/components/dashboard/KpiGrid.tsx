import { KpiCard } from "./KpiCard";
import type { DashboardKpis } from "../../types/dashboard";

interface Props {
  kpis: DashboardKpis;
}

const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000) {
    return `S/ ${(value / 1_000_000).toFixed(2)} M`;
  }

  if (value >= 1_000) {
    return `S/ ${(value / 1_000).toFixed(2)} K`;
  }

  return `S/ ${value.toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
export function KpiGrid({ kpis }: Props) {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        title="Productos"
        value={kpis.totalProducts}
        description="Productos registrados"
        color="blue"
        icon={<i className="fa fa-cube" />}
      />

      <KpiCard
        title="Inventarios"
        value={kpis.totalInventories}
        description="Inventarios creados"
        color="green"
        icon={<i className="fa fa-archive" />}
      />

      <KpiCard
        title="Conteos"
        value={kpis.totalCountItems}
        description="Productos contados"
        color="amber"
        icon={<i className="fa fa-check-square-o" />}
      />

      <KpiCard
        title="Valor Inventario"
        value={formatCompactCurrency(kpis.totalInventoryValue)}
        tooltip={`S/ ${kpis.totalInventoryValue.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`}
        description="Valor económico"
        color="emerald"
        icon={<i className="fa fa-money" />}
        />

      <KpiCard
        title="Stock Bajo"
        value={kpis.lowStockProducts}
        description="Productos en alerta"
        color="red"
        icon={<i className="fa fa-exclamation-triangle" />}
      />
    </div>
  );
}