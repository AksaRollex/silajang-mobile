import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function usePeraturan() {
  return useQuery({
    queryKey: ["master", "peraturan"],
    queryFn: () => axios.get("/master/peraturan").then(res => res.data.peraturans),
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
