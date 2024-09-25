import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Logout = () => {
  const navigation = useNavigation();
  const QueryClient = useQueryClient();

  const { mutate: logout } = useMutation(() => axios.post("/auth/logout"), {
    onSuccess: async () => {
      await AsyncStorage.removeItem("@auth-token");
      Toast.show({
        type: "success",
        text1: "Logout Berhasil",
      });
      QueryClient.invalidateQueries(["auth", "user"]);
      navigation.navigate("Login");
    },
    onError: error => {
      Toast.show({
        type: "error",
        text1: "Gagal Logout",
      });
    },
  });

  const fetchData = async () => {
    try {
      const response = await axios.get("/auth"); // Memanggil API
      response.data.user;

    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Menonaktifkan loading saat terjadi error
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.buttonLogout} hyperlink onPress={logout}>
        <Text style={styles.buttonLogoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
 
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonLogout: {
    backgroundColor: "#C0392B",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  buttonLogoutText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
});
export default Logout;
