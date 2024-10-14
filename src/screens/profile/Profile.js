import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Dimensions
} from "react-native";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import { useUser } from "@/src/services";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import BackButton from "../components/Back";
import FastImage from "react-native-fast-image";
import Icon from "react-native-vector-icons/Feather";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
const { width, height } = Dimensions.get('window');
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

export default function Profile({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false); // State untuk modal visibility
  const queryClient = useQueryClient();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  // const openWhatsApp = () => {
  //   const phoneNumber = '+6281359512588'; // Ganti dengan nomor tujuan
  //   const url = `whatsapp://send?phone=${phoneNumber}`;

  //   Linking.openURL(url).catch((err) => {
  //     console.error('Error occurred', err);
  //     alert('WhatsApp is not installed or there is an issue.');
  //   });
  // };

  const { data: userData, isLoading } = useUser();

  console.log(userData);
  const handleLogout = () => {
    setModalVisible(true);
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

  const openImageViewer = imageUrl => {
    setSelectedImage(`${process.env.APP_URL}${imageUrl}`);
    setImageViewerVisible(true);
  };
  return (
    <>
      <View
        className="w-full py-4 px-3"
        style={{ backgroundColor: Colors.brand }}>
        <BackButton
          action={() => navigation.goBack()}
          size={25}
          color="white"
        />
      </View>

      {userData ? (
        <View
          elevetion={5}
          className="w-full py-5 px-4 bg-[#fff]
        "
          style={{
            borderBottomWidth: 0.5,
            borderBottomColor: "#dedede",
            elevation: 0.5,
          }}>
          <View className="w-full items-center justify-center ">
            {userData ? (
              <TouchableOpacity onPress={() => openImageViewer(userData.photo)}>
                <FastImage
                  className="rounded-full w-24 h-24 "
                  source={{
                    uri: `${process.env.APP_URL}${userData.photo}`,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </TouchableOpacity>
            ) : (
              <View></View>
            )}
          </View>
          <View className="flex-col align-center justify-center mx-2 mt-2  ">
            <Text className="text-base text-black font-bold font-sans my-1 text-center ">
              {userData?.nama} / {userData?.golongan.nama}
            </Text>
            <Text className="text-sm font-bold  text-indigo-6 00 mt-1 text-center text-black">
              {userData?.email}
            </Text>
            <Text className="text-sm font-bold  text-indigo-6 00 mt-1 text-center text-black">
              {userData?.phone}
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
          className="bg-[#fff] w-full py-6 px-6  flex-row justify-between items-center"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#dedede",
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}>
          <View className="flex-row items-center">
            <Icon name="user" size={29} color="#312e81" />
            <Text className="text-black font-sans ml-3">
              Informasi Personal
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        {/* Informasi Perusahaan */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Perusahaan")}
          className="bg-[#fff] w-full py-6 px-6 flex-row justify-between items-center"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#dedede",
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}>
          <View className="flex-row items-center">
            <Icon name="archive" size={29} color="#312e81" />
            <Text className="text-black font-sans ml-3">
              Informasi Perusahaan
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        {/* Ganti Password */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Keamanan")}
          className="bg-[#fff] w-full py-6 px-6 flex-row justify-between items-center"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#dedede",
            elevation: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}>
          <View className="flex-row items-center">
            <Icon name="lock" size={29} color="#312e81" />
            <Text className="text-black font-sans ml-3">Ganti Password</Text>
          </View>
          <Icon name="chevron-right" size={24} color="black" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-100 w-full py-6 px-6  flex-row justify-between items-center"
          onPress={handleLogout}
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
          }}>
          <View className="flex-row items-center">
            <Icon name="log-out" size={29} color="red" />
            <Text className="text-red-500 font-sans ml-3">Logout</Text>
          </View>
          <Icon name="chevron-right" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {/* Modal Logout */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}>
          <View
            style={{
              width: 300,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
              alignItems: "center",
            }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
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
                }}>
                <Text style={{ color: "black" }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmLogout}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#f2416e",
                  borderRadius: 5,
                }}>
                <Text style={{ color: "white" }}>Ya, Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL IMGE VIEWER */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={imageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}>
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageViewerVisible(false)}>
              <IonIcons name="close" size={40} color="white" />
          </TouchableOpacity>
          <FastImage
            style={styles.fullScreenImage}
            source={{
              uri: selectedImage,
              priority: FastImage.priority.high,
            }}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </Modal>

      {/* <View className="p-2 rounded-full w-14 bg-green-500 absolute bottom-5 right-5">
        <TouchableOpacity onPress={openWhatsApp}>
          <Icons
            name="whatsapp"
            size={40}
            color="white"
            className="bg-green-600 p-2 rounded-full"
          />
        </TouchableOpacity>
      </View> */}
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
   imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
