import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useSetting() {
  return useQuery({
    queryKey: ["app", "setting"],
    queryFn: () => axios.get("/setting").then(res => res.data),
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
