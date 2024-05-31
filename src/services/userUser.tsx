import { useQuery } from "@tanstack/react-query";
import axios from "../libs/axios";
import SplashScreen from "react-native-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: () => axios.get("/auth/user").then(res => res.data.data),
    staleTime: 0,
    cacheTime: 0,
    onSettled: () => {
      SplashScreen.hide();
    },
    onError: async (error: any) => {
      console.error(error);
      await AsyncStorage.removeItem("@auth-token");
    },
  });
}
