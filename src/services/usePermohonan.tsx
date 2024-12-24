import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function usePermohonan(uuid : string | string [], options = {}) {
  return useQuery({
    queryKey: ["permohonan", uuid ],
    queryFn: () => axios.get(`/permohonan/${uuid}`).then(res => res.data.data ),
    onError: async (error: any) => {
      console.error(error);
    },
    ...options, // Tambahkan opsi tambahan jika ada
  });
}
