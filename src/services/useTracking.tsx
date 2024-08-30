import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";

export function useTracking() {
  return useQuery({
    queryKey: ["auth", "tracking", "get"],
    queryFn: () => axios.get("/tracking/get").then(res => res.data.tracking),
    staleTime: 0,
    cacheTime: 0,
    onError: async (error: any) => {
      console.error(error);
    },
  });
}
