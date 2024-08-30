import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function usePermohonan() {
  return useQuery({
    queryKey: ["auth","permohonan", "gets"],
    queryFn: () => axios.get("/permohonan/gets").then(res => res.data.permohonan),
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
