import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function usePembayaran() {
  return useQuery({
    queryKey: ["pembayaran", "pengujian"],
    queryFn: () => axios.get("/pembayaran/pengujian").then(res => res.data.pembayaran), // Make sure it matches the response key
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
