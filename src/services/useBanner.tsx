import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useBanner() {
  return useQuery({
    queryKey: ["banner"],
    queryFn: () => axios.get("/konfigurasi/banner").then(res => res.data.data),
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
