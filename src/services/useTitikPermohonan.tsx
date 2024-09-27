import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useTitikPermohonan(uuid : string | string [], options = {}) {
  return useQuery({
    queryKey: ["permohonan", "titik", uuid ],
    queryFn: () => axios.get(`/permohonan/titik/${uuid}`).then(res => res.data.data),
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
