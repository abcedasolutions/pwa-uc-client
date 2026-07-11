import { useState } from "react";
import type { Product } from "../api/types";
import { useProducts } from "../hooks/useProducts";
import { ProductList } from "../components/products/ProductList";
import { ProductFormModal } from "../components/products/ProductFormModal";
import { ProductDetailModal } from "../components/products/ProductDetailModal";
import { ScanToProductFlow } from "../components/scanner/ScanToProductFlow";
import { getProductByCode } from "../db/indexedDb";

export function ProductListPage() {
  const { data: products = [] } = useProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [formExisting, setFormExisting] = useState<Product | null>(null);
  const [formPrefillCode, setFormPrefillCode] = useState<string | null>(null);

  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  function openCreate() {
    setFormExisting(null);
    setFormPrefillCode(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setDetailProductId(null);
    setFormExisting(product);
    setFormPrefillCode(null);
    setFormOpen(true);
  }

  async function handleScanned(code: string) {
    const existing = await getProductByCode(code);
    if (existing) {
      setDetailProductId(existing._id);
    } else {
      setFormExisting(null);
      setFormPrefillCode(code);
      setFormOpen(true);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <i className="fa fa-barcode" aria-hidden="true" /> Escanear
        </button>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          <i className="fa fa-plus" aria-hidden="true" /> Manual
        </button>
      </div>

      <ProductList products={products} onOpen={(p) => setDetailProductId(p._id)} />

      <ProductFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        existing={formExisting}
        prefillCode={formPrefillCode}
      />

      <ProductDetailModal
        open={!!detailProductId}
        onClose={() => setDetailProductId(null)}
        productId={detailProductId}
        onEdit={openEdit}
      />

      <ScanToProductFlow open={scanOpen} onClose={() => setScanOpen(false)} onResolved={handleScanned} />
    </div>
  );
}
