import Axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

console.log({API_URL})
const axios = Axios.create({
  baseURL: API_URL,
  mode: 'no-cors',
  headers: {
    "Content-Type": "application/json",
    // "Content-Type": "multipart/form-data",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

axios.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem("@auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axios;
