import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function usePengumuman() {
  return useQuery({
    queryKey: ["pengumuman"],
    queryFn: () => axios.get("/konfigurasi/pengumuman").then(res => res.data.data),
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
