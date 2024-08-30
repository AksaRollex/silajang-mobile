import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useParameter() {
  return useQuery({
    queryKey: ["master", "parameter"],
    queryFn: () => axios.get("/master/parameter").then(res => res.data.parameters),
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
