import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import axios from "@/src/libs/axios";
import Akun from "./Akun";
import Perusahaan from "./Perusahaan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Keamanan from "./Keamanan";
import { Colors } from "react-native-ui-lib";
import {
  useNavigation,
  useNavigationContainerRef,
} from "@react-navigation/native";

export default function Profile() {
  const [activeComponent, setActiveComponent] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const queryClient = useQueryClient()

  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        // console.log("Response Data:", response.data.user); // Log data response
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error); // Log error
      });
  }, []);

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

  const {
    mutate: logout,
    isLoading,
    isSuccess,
    isError,
  } = useMutation(data => axios.post("/auth/logout"), {
    onSuccess: async () => {
      await AsyncStorage.removeItem("@auth-token");
      Toast.show({
        type: "success",
        text1: "Logout Berhasil",
      });
      queryClient.invalidateQueries(["auth", "user"]);
      // navigation.navigate("tabs");
    },
    onError: error => {
      Toast.show({
        type: "error",
        text1: "Gagal Logout",
      });
    },
  });
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>SI - LAJANG</Text>
      </View>
      <TouchableOpacity
        style={styles.buttonLogout}
        hyperlink
        onPress={() => logout()}>
        <Text style={styles.buttonLogoutText}>Logout</Text>
      </TouchableOpacity>
      <View style={styles.cardContainer}>
        <View style={[styles.profileCard, { backgroundColor: Colors.brand }]}>
          <View style={styles.photoProfileCard}>
            <Image
              style={styles.image}
              source={{
                uri: "https://i.pinimg.com/originals/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.webp",
              }}
              resizeMode="cover"
            />
          </View>
          <View style={styles.ProfileCardText}>
            {userData ? (
              <>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/checked.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{userData.user.nama}</Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/verification.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{userData.user.email}</Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/phone.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{userData.user.phone}</Text>
                </View>
                <View style={styles.iconTextRow}>
                  <Image
                    source={require("@/assets/images/gear-assembly.png")}
                    style={styles.icon}
                  />
                  <Text style={styles.text}>{userData.user.golongan.nama}</Text>
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
    backgroundColor: Colors.brand, // Ganti dengan warna yang sesuai
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // Menyusun elemen secara horizontal
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
    marginLeft: 10, // Beri jarak antara logo dan teks
    alignSelf: "center", // Vertically align the text to the center
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
    // backgroundColor : 'green',
    justifyContent: "center",
    alignItems: "flex-start",
  },
  iconTextRow: {
    flexDirection: "row", // Untuk mengatur gambar dan teks berdampingan
    alignItems: "center", // Vertikal pusat gambar dan teks
    marginBottom: 4, // Menambahkan jarak antara setiap baris gambar dan teks
  },
  icon: {
    width: 16, // Sesuaikan ukuran gambar
    height: 16, // Sesuaikan ukuran gambar
    marginRight: 8, // Jarak antara gambar dan teks
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
    display: "flex",
    justifyContent: "space-around",
  },
  button: {
    width: 110,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    margin: 10,
    backgroundColor: "#6b7fde",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonLogout: {
    backgroundColor: "#C0392B", // Warna merah untuk tombol logout
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    marginHorizontal: 20, // Optional: add some margin to the button
    marginVertical: 10,
  },
  buttonLogoutText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  activeComponentContainer: {
    flex: 1,
    width: "100%",
  },
});
