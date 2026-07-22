import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

import type { CategorySummary } from "../../types/dashboard";

interface Props {
  categories: CategorySummary[];
}

const COLORS = [
  "#2563eb",
  "#059669",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#65a30d",
  "#ea580c",
];

export function CategoryChart({ categories }: Props) {
  const data = categories.map((c) => ({
    name: c.category,
    value: c.products,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-800">
          Productos por categoría
        </h2>

        <p className="text-sm text-slate-500">
          Distribución del catálogo de productos.
        </p>
      </div>
    
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
            <div className="xl:col-span-2 h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={105}
                        innerRadius={55}
                        paddingAngle={3}
                    >
                        {data.map((_, index) => (
                        <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                        />
                        ))}
                    </Pie>

                    <Tooltip />

                    </PieChart>
                </ResponsiveContainer>
            </div>
        
            <div className="xl:col-span-3">
                <div className="rounded-xl border border-slate-100">
                    <div className="grid grid-cols-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Categoría</span>
                    <span className="text-center">Productos</span>
                    <span className="text-right">Valor</span>
                    </div>

                    {categories.map((category, index) => (
                    <div
                        key={category.category}
                        className="grid grid-cols-3 items-center border-b border-slate-100 px-4 py-3 last:border-b-0"
                    >
                        <div className="flex items-center gap-2">
                        <span
                            className="h-3 w-3 rounded-full"
                            style={{
                            backgroundColor: COLORS[index % COLORS.length],
                            }}
                        />

                        <span className="truncate text-sm">
                            {category.category}
                        </span>
                        </div>

                        <span className="text-center text-sm font-medium">
                        {category.products}
                        </span>

                        <span className="text-right text-sm font-semibold">
                        S/ {category.inventoryValue.toLocaleString("es-PE")}
                        </span>
                    </div>
                    ))}
                </div>  
            </div>
        </div>
    </div>
  );
}