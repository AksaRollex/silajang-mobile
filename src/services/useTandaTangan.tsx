import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useTandaTangan() {
  return useQuery({
    queryKey: ["tanda-tangan"],
    queryFn: () => axios.get("/konfigurasi/tanda-tangan").then(res => res.data.data),
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
