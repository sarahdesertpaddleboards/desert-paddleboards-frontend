import { useQuery } from "@tanstack/react-query";
import { fetchAdminProducts } from "@/lib/adminApi";

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });
}
