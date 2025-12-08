import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ProductsManagement() {
  const { data: products, isLoading } = trpc.shop.listProducts.useQuery();

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-muted-foreground">Manage your shop inventory</p>
        </div>
        <Button onClick={() => toast.info("Add Product form coming soon!")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">
                    ${(product.price / 100).toFixed(2)}
                  </span>
                  {product.isDigital ? (
                    <Badge>Digital</Badge>
                  ) : (
                    <Badge variant="secondary">
                      Stock: {product.inventory ?? "∞"}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => toast.info("Edit coming soon!")}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.info("Delete coming soon!")}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first product to start selling
              </p>
              <Button onClick={() => toast.info("Add Product form coming soon!")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
