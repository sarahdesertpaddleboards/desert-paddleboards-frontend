import { useAdminProducts } from "@/hooks/useAdminProducts";

export default function Admin() {
  const { data, isLoading, error } = useAdminProducts();

  if (isLoading) {
    return <div className="p-8">Loading products…</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load admin products. Are you logged in?
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin · Products</h1>

      <div className="space-y-4">
        {data!.map(product => (
          <div
            key={product.productKey}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">
                {product.name}
              </div>
              <div className="text-sm text-gray-600">
                {product.productKey} · {product.type}
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono">
                ${(product.price / 100).toFixed(2)} {product.currency.toUpperCase()}
              </div>
              <div
                className={`text-sm ${
                  product.active ? "text-green-600" : "text-gray-400"
                }`}
              >
                {product.active ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
