// src/hooks/useAdminProducts.ts
import {
  fetchAdminProducts,
  updateAdminProduct,
  createAdminProduct,
  AdminProduct,
} from "@/lib/adminApi";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useAdminProducts() {
  return useQuery<AdminProduct[], Error>({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
    staleTime: 30_000,
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productKey,
      updates,
    }: {
      productKey: string;
      updates: Partial<
        Pick<
          AdminProduct,
          "name" | "description" | "price" | "currency" | "active" | "type"
        >
      >;
    }) => updateAdminProduct(productKey, updates),
    onSuccess: () => {
      // Refresh products after a successful save
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<AdminProduct, "hasOverride">) =>
      createAdminProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
  });
}
