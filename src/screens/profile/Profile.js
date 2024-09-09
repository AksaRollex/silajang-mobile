import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl, // Import RefreshControl
} from "react-native";
import axios from "@/src/libs/axios";
import Akun from "./Akun";
import Perusahaan from "./Perusahaan";
import Keamanan from "./Keamanan";
import { Colors } from "react-native-ui-lib";
import {
  useNavigation,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export default function Profile() {
  const [activeComponent, setActiveComponent] = useState(null);
  const [data, setData] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // State for refreshing
  const navigation = useNavigation();
  const QueryClient = useQueryClient();

  useEffect(() => {
    fetchData();
  }, []);

  // Fungsi untuk mengambil data dari API
  const fetchData = async () => {
    try {
      const response = await axios.get("/auth"); // Memanggil API
      const { nama, email, phone, golongan } = response.data.user;
      console.log(response.data.user);
      setData({ nama, email, phone, golongan });
      setLoading(false); // Menonaktifkan loading setelah data berhasil diambil

      //gambar 
      const { photo } = response.data.user
      const fullImageUrl = `http://192.168.61.240:8000${photo}?t=${new Date().getTime()}`;
      

      // Set URL gambar
      setImageUrl(fullImageUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // Menonaktifkan loading saat terjadi error
    }
  };

  // REFRESH
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
    setRefreshing(false);
  };

  // COMPONENT PROFILE
  let RenderedComponent;
  switch (activeComponent) {
    case "Akun":
      RenderedComponent = <Akun />;
      break;
    case "Perusahaan":
      RenderedComponent = <Perusahaan />;
      break;
    case "Keamanan":
      RenderedComponent = <Keamanan />;
      break;
    default:
      RenderedComponent = null;
      break;
  }

  // LOGOUT
  const {
    mutate: logout,
    isLoading,
    isSuccess,
    isError,
  } = useMutation(() => axios.post("/auth/logout"), {
    onSuccess: async () => {
      await AsyncStorage.removeItem("@auth-token");
      Toast.show({
        type: "success",
        text1: "Logout Berhasil",
      });
      QueryClient.invalidateQueries(["auth", "user"]);
      navigation.navigate("Login"); // Redirect to login page
    },
    onError: error => {
      Toast.show({
        type: "error",
        text1: "Gagal Logout",
      });
    },
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>SI - LAJANG</Text>
      </View>
      <TouchableOpacity style={styles.buttonLogout} hyperlink onPress={logout}>
        <Text style={styles.buttonLogoutText}>Logout</Text>
      </TouchableOpacity>
      <View style={styles.cardContainer}>
        <View style={[styles.profileCard, { backgroundColor: Colors.brand }]}>
          <View style={styles.photoProfileCard}>
            <Image
              style={styles.image}
              source={{ uri: imageUrl }}
              resizeMode="cover"
            />
          </View>
          <View style={styles.ProfileCardText}>
            {data ? (
              <>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/checked.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{data.nama}</Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/verification.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{data.email}</Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/phone.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{data.phone}</Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/gear-assembly.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{data.golongan?.nama}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.text}>Loading...</Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setActiveComponent("Akun")}>
            <Text style={styles.buttonText}>Akun</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setActiveComponent("Keamanan")}>
            <Text style={styles.buttonText}>Keamanan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setActiveComponent("Perusahaan")}>
            <Text style={styles.buttonText}>Perusahaan</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activeComponentContainer}>{RenderedComponent}</View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    alignSelf: "center",
  },
  cardContainer: {
    flex: 1,
    alignItems: "center",
  },
  profileCard: {
    height: 140,
    width: 380,
    borderRadius: 10,
    flexDirection: "row",
    backgroundColor: "#6b7fde",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  photoProfileCard: {
    height: 120,
    width: 120,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  ProfileCardText: {
    width: 230,
    height: 120,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  text: {
    color: "white",
    fontSize: 14,
    paddingLeft: 10,
    padding: 4,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    width: 115,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    margin: 10,
    backgroundColor: "#6b7fde",
  },
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
  activeComponentContainer: {
    marginTop: 10,
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
});
