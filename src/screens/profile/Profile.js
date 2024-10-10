import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
  Modal,
} from "react-native";
import axios from "@/src/libs/axios";
import Akun from "./tabs/Akun";
import Perusahaan from "./tabs/Perusahaan";
import Keamanan from "./tabs/Keamanan";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fontawesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "react-native-ui-lib";
import Header from "../components/Header";
import { API_URL } from "@env";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Button } from "react-native-ui-lib";
import BackButton from "../components/Back";
import FastImage from "react-native-fast-image";
import MateriallIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Feather";

export default function Profile({ navigation }) {
  const [activeComponent, setActiveComponent] = useState("Akun");
  const [userData, setUserData] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // State untuk modal visibility
  const queryClient = useQueryClient();
  const [imageLoadError, setImageLoadError] = useState(false);

  // Fetch user data
  const fetchData = async () => {
    try {
      const response = await axios.get("/auth");
      const { nama, email, phone, golongan, photo } = response.data.user;
      setData({ nama, email, phone, golongan });
      setLoading(false);

      const fullImageUrl = `${API_URL}${photo}?t=${new Date().getTime()}`;
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Another fetch for user data
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handlePress = component => {
    setActiveComponent(component);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleCancel = () => {
    setActiveComponent(null);
  };

  const handleLogout = () => {
    setModalVisible(true); // Menampilkan modal saat tombol logout ditekan
  };

  const confirmLogout = () => {
    setModalVisible(false);
    logout();
  };

  const [isPressed, setIsPressed] = useState(false);

  const { mutate: logout } = useMutation(() => axios.post("/auth/logout"), {
    onSuccess: async () => {
      await AsyncStorage.removeItem("@auth-token");
      Toast.show({
        type: "success",
        text1: "Logout Berhasil",
      });
      queryClient.invalidateQueries(["auth", "user"]);
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Gagal Logout",
      });
    },
  });

  return (
    <>
      <View className="w-full bg-[#321e81] py-4 px-3">
        <BackButton action={() => navigation.goBack()} size={25} color="white" />
      </View>

      {userData ? (
        <View elevetion={5} className="w-full py-5 bg-[#fff] flex-row ">
          <View className="w-1/5 items-center justify-center">
            <Image
              source={require("@/assets/images/avatar.png")}
              className="w-14 h-14 rounded-full"
            />
          </View>
          <View className="flex-col align-center justify-center ">
            <Text className="text-base text-black font-bold my-1">
              {userData?.user.nama}
            </Text>
            <Text className="text-sm font-bold text-black ">
              {userData?.user.email}
            </Text>
          </View>
        </View>
      ) : (
        <View className="h-full flex justify-center">
          <ActivityIndicator size={"large"} color={"#312e81"} />
        </View>
      )}

      <View>
        {/* Informasi Personal */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Akun")}
          className="bg-[#fff] w-full py-6 px-4 mt-5 flex-row justify-between items-center"
          style={{ 
            borderBottomWidth: 1, 
            borderBottomColor: "#dedede",
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,    
          }}
        >
          <View className="flex-row items-center">
            <Icon name="user" size={29} color="black" />
            <Text className="text-black font-sans ml-3">Informasi Personal</Text>
          </View>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        {/* Informasi Perusahaan */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Perusahaan")}
          className="bg-[#fff] w-full py-6 px-4 flex-row justify-between items-center"
          style={{ 
            borderBottomWidth: 1, 
            borderBottomColor: "#dedede",
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            
          }}
        >
          <View className="flex-row items-center">
            <Icon name="archive" size={29} color="black" />
            <Text className="text-black font-sans ml-3">Informasi Perusahaan</Text>
          </View>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        {/* Ganti Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Keamanan")}
          className="bg-[#fff] w-full py-6 px-4 flex-row justify-between items-center"
          style={{ 
            borderBottomWidth: 1, 
            borderBottomColor: "#dedede",
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            }}
        >
          <View className="flex-row items-center">
            <Icon name="lock" size={29} color="black" />
            <Text className="text-black font-sans ml-3">Ganti Password</Text>
          </View>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          className={`w-full py-6 px-4 mt-3 flex-row justify-between items-center ${
            isPressed ? 'bg-red-700' : 'bg-[#fff]'
          }`}
          onPress={handleLogout}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          style={{ 
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}
        >
          <View className="flex-row items-center">
            <Icon name="log-out" size={24} color="red" />
            <Text className={`font-sans ml-3 ${isPressed ? 'text-white' : 'text-red-700'}`}>
            Logout</Text>
          </View>
          <Icon name="chevron-right" size={24} color={isPressed ? 'white' : 'red'} />
        </TouchableOpacity>
      </View>

      {/* Modal Logout */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
              Konfirmasi Logout
            </Text>

            <View
              style={{
                width: "100%",
                borderBottomWidth: 1,
                borderBottomColor: "#dedede",
                marginBottom: 15,
              }}
            />

            <Text style={{ fontSize: 16, marginBottom: 25 }}>
              Apakah Anda yakin ingin keluar?
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#dedede",
                  borderRadius: 5,
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "black" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#f2416e",
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: "white" }}>Ya, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  header: {
    backgroundColor: "#ececec",
    justifyContent: "flex-end",
    zIndex: 1,
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 28,
    zIndex: 2,
    alignItems: "center",
  },
  profileCard: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 20,
    backgroundColor: "white",
    overflow: "hidden",
    marginTop: -187,
  },
  logo: {
    width: rem(2.25),
    height: rem(2.25),
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
    width: 220,
    height: 120,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  profileCardTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#333",
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontWeight: "600",
    lineHeight: 24,
  },
  editProfileTextContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  editProfileText: {
    color: "#64748b",
    fontSize: 19,
    fontWeight: "bold",
  },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
    alignSelf: "center",
  },
  accordionItem: {},
  activeButtonBox: {
    backgroundColor: "#e1e7ff",
  },
  buttonText: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  activeComponentContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  buttonLine: {
    position: "absolute",
    top: 0,
    width: "97%",
    height: 4,
    borderRadius: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 1,
  },
  activeButtonLine: {
    backgroundColor: "#312e81",
  },
  activeButtonLine2: {
    backgroundColor: "#008000",
  },
  activeButtonLine3: {
    backgroundColor: "#ff0000",
  },

  buttonBox: {
    width: 400, // Lebar lebih besar agar memanjang
    height: 100, // Menjaga tinggi tetap sama
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000", // Pastikan shadowColor memiliki nilai warna yang valid
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, // Tingkatkan elevation agar shadow terlihat lebih jelas pada tombol besar
    margin: 10,
    position: "relative",
  },
});
