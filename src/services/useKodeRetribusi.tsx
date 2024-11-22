import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useKodeRetribusi() {
  return useQuery({
    queryKey: ["kode-retribusi"],
    queryFn: () =>
      axios.get("/master/kode-retribusi").then(res => res.data.data),
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
