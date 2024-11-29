// profil

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Linking,
  Dimensions,
  StyleSheet,
  Image,
  ImageBackground,
} from "react-native";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import { useUser } from "@/src/services";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
// import BackButton from "@/src/screens/components/BackButton";
// import FastImage from "react-native-fast-image";
// import LottieView from "lottie-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Feather";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import { TextFooter } from "../components/TextFooter";
import { black } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

const { width, height } = Dimensions.get("window");
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

export default function Profile({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const { data: userData, isLoading } = useUser();

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
    <View
      className="flex-1"
      style={{
        backgroundColor: "#312e81",
      }}
    >
      <>
        {userData ? (
          <View className="z-10 bottom-32">
            <View
              className="w-full py-5 rounded-b-2xl">
              <Text className="text-white text-xl font-poppins-bold mx-6 top-32 self-start">
              </Text>
              <View className="w-full items-center mt-32 justify-center">
                {userData ? (
                  <TouchableOpacity
                    onPress={() => openImageViewer(userData.photo)}
                    style={{ position: "absolute", zIndex: 10, top: "50%", alignSelf: "center" }}
                  >
                    {userData.photo ? (
                      <View className="rounded-full w-28 h-28 overflow-hidden">
                        <Image
                          source={{ uri: `${process.env.APP_URL}${userData.photo}` }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                    ) : (
                      <View
                        className="rounded-full  bg-gray-300 items-center justify-center"
                        style={{ borderWidth: 2, borderColor: "#E2E8F0", width: 135, height: 135 }}
                      >
                        <IonIcons
                          name="person"
                          size={50}
                          color="#666666"
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <View></View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View className="h-full flex justify-center">
            <ActivityIndicator size={"large"} color={"#312e81"} />
          </View>
        )}
        <View className="h-full bottom-20">
          <View className="rounded-3xl h-full bg-[#F9FAFB]">
            {userData ? (
              <>
                <View className="flex-col align-center justify-center mx-2 mt-20">
                  <Text className="text-[14px] text-black font-poppins-bold my-1 text-center ">
                    {userData?.nama}
                  </Text>
                  <Text className="text-[13px] text-gray-500 font-poppins-semibold text-center ">
                    {userData?.email}
                  </Text>
                </View>
                <View className="w-full h-1 bg-gray-300 mt-3" />
              </>
            ) : (
              <View></View>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate("Akun")}
              className=" w-full py-6 px-6  flex-row justify-between items-center"
              style={{ zIndex: 5 }}>
              <View className="flex-row items-center">
                <IonIcons name="person-sharp" size={20} color="#312e81" />
                <Text className="text-black font-poppins-regular ml-3 mt-1">
                  Informasi Personal
                </Text>
              </View>
              <Icon name="chevron-right" size={21} color="black" />
            </TouchableOpacity>

            <View className="w-full h-px bg-gray-300 " />

            <TouchableOpacity
              onPress={() => navigation.navigate("Perusahaan")}
              className=" w-full py-6 px-6 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <IonIcons name="business" size={20} color="#312e81" />
                <Text className="text-black font-poppins-regular ml-3 mt-1">
                  Informasi Perusahaan
                </Text>
              </View>
              <Icon name="chevron-right" size={21} color="black" />
            </TouchableOpacity>

            <View className="w-full h-px bg-gray-300 " />

            <TouchableOpacity
              onPress={() => navigation.navigate("Keamanan")}
              className=" w-full py-6 px-6 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <IonIcons
                  name="shield-checkmark-sharp"
                  size={20}
                  color="#312e81"
                />
                <Text className="text-black font-poppins-regular ml-3 mt-1">
                  Ganti Password
                </Text>
              </View>
              <Icon name="chevron-right" size={21} color="black" />
            </TouchableOpacity>

            <View className="w-full h-px bg-gray-300 " />

            <TouchableOpacity
              className=" w-full py-6 px-6  flex-row justify-between items-center"
              onPress={handleLogout}
            // style={{
            //   elevation: 2,
            //   shadowColor: "#000",
            //   shadowOffset: { width: 0, height: 2 },
            //   shadowOpacity: 0.2,
            //   shadowRadius: 2,
            // }}
            >
              <View className="flex-row items-center">
                <Icon name="log-out" size={20} color="red" />
                <Text className="text-red-500 font-poppins-regular ml-3">
                  Logout
                </Text>
              </View>
              <Icon name="chevron-right" size={21} color="red" />
            </TouchableOpacity>
            <View className="w-full h-px bg-gray-300 mt-1" />
            <View className="justify-self-center">
              <View className="top-20 items-center justify-center flex-end">
                <Text className="self-center">
                  {/* <TextFooter /> */}
                </Text>
              </View>
            </View>
            {/* Modal Logout */}
            <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              width: 300,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 18, marginBottom: 15 }} className="font-poppins-semibold text-black">Konfirmasi Logout</Text>

              <View style={{
                width: '100%',
                borderBottomWidth: 1,
                borderBottomColor: '#dedede',
                marginBottom: 15,
              }} />

              <Text style={{ fontSize: 15, marginBottom: 25, marginLeft: 5 }} className="font-poppins-regular text-black">Apakah anda yakin ingin keluar?</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#dedede',
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: 'gray' }} className="font-poppins-regular">Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-red-100"
                  onPress={confirmLogout}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text className="text-red-500 font-poppins-medium">Ya, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
              </View>
            </Modal>
          </View>
        </View>

      </>
    </View>
  );
}

const styles = StyleSheet.create({
  imageViewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
});