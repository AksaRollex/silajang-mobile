import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useParameter() {
  return useQuery({
    queryKey: ["master", "paket"],
    queryFn: () => axios.get("/master/paket").then(res => res.data.pakets),
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
