import type { LowStockProduct } from "../../types/dashboard";


interface Props {
  products: LowStockProduct[];
}

const getProgress = (stock: number, minimum: number) =>
  Math.min((stock / minimum) * 100, 100);

const getStatus = (stock: number, minimum: number) => {
  if (stock < minimum) {
    return {
      color: "bg-red-500",
      text: "text-red-600",
      icon: "🔴",
    };
  }

  if (stock === minimum) {
    return {
      color: "bg-yellow-500",
      text: "text-yellow-600",
      icon: "🟡",
    };
  }

  return {
    color: "bg-green-500",
    text: "text-green-600",
    icon: "🟢",
  };
};
export function LowStockPanel({ products }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Stock Bajo
          </h2>

          <p className="text-sm text-slate-500">
            Productos que requieren reposición
          </p>
        </div>

        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
          {products.length}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          ✅ No existen productos con stock bajo.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => {

                const progress = getProgress(
                    product.quantity,
                    product.minStock
                );

                const status = getStatus(
                    product.quantity,
                    product.minStock
                );

                const missing = Math.max(
                    product.minStock - product.quantity,
                    0
                );

                return (
            <div
                    key={product.id}
                    className="rounded-xl border border-slate-200 p-4 shadow-sm transition hover:shadow-md"
                >

                    <div className="flex items-center gap-2">

                        <span className="text-lg">
                            {status.icon}
                        </span>

                        <h3 className="font-semibold text-slate-800">
                            {product.name}
                        </h3>

                    </div>

                    <div className="mt-4">

                        <div className="flex justify-between text-xs text-slate-500">

                            <span>
                                Nivel de stock
                            </span>

                            <span className={status.text}>
                                {progress.toFixed(0)}%
                            </span>

                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                            <div
                                className={`h-full rounded-full ${status.color}`}
                                style={{
                                    width: `${progress}%`,
                                }}
                            />

                        </div>

                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">

                        <div>

                            <p className="text-xs text-slate-500">
                                Stock
                            </p>

                            <p className="text-lg font-bold text-slate-800">
                                {product.quantity}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs text-slate-500">
                                Mínimo
                            </p>

                            <p className="text-lg font-bold text-slate-800">
                                {product.minStock}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs text-slate-500">
                                Faltan
                            </p>

                            <p className="text-lg font-bold text-red-600">
                                {missing}
                            </p>

                        </div>

                    </div>

                </div>
                );
            })}
        </div>
       )}
    </div>
  );
}