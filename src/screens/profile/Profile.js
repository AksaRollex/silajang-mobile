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
import BackButton from "../components/Back";
import FastImage from "react-native-fast-image";
import LottieView from "lottie-react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/Feather";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import FooterText from "../components/FooterText";
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
    <ImageBackground
    source={require('../../../assets/images/background.png')}
      style={{ flex: 1, height: "30%" }} // Pastikan gambar menutupi seluruh layar
      imageStyle={{
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}
    >
      <>
      {userData ? (
          <View className="z-10 bottom-20">
            <View
              className="w-full py-5 rounded-b-2xl">
              <Text className="text-white text-xl font-poppins-bold mx-6 top-24">
                Profil Saya
              </Text>
              <View className="w-full items-center mt-40 justify-center">
                {userData ? (
                  <TouchableOpacity
                    onPress={() => openImageViewer(userData.photo)}
                    style={{ position: "absolute", zIndex: 10, top: "50%", alignSelf: "center" }}
                    >
                    <FastImage
                      className="rounded-full w-28 h-28"
                      source={{
                        uri: userData?.photo
                          ? `${process.env.APP_URL}${userData.photo}`
                          : "https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3467.jpg",
                        priority: FastImage.priority.high,
                      }}
                      style={{
                        borderWidth: 3,
                        borderColor: "#E2E8F0",
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                    />
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
        <View className="h-full bottom-11">
          <View className="rounded-3xl h-full bg-slate-200">
            {userData ? (
              <>
                <View className="flex-col align-center justify-center mx-2 mt-16">
                  <Text className="text-base text-black font-poppins-bold my-1 text-center ">
                    {userData?.nama}
                  </Text>
                  <Text className="text-base text-black font-poppins-semibold text-center ">
                    {userData?.email}
                  </Text>
                </View>
                <View className="w-full h-px bg-gray-300 mt-3" />
              </>
            ) : (
              <View></View>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate("Akun")}
              className=" w-full py-6 px-6  flex-row justify-between items-center"
              style={{ zIndex: 5 }}>
              <View className="flex-row items-center">
                <IonIcons name="person-sharp" size={29} color="#2196F3" />
                <Text className="text-black font-poppins-regular ml-3 mt-1">
                  Informasi Personal
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Perusahaan")}
              className=" w-full py-6 px-6 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <IonIcons name="business" size={29} color="#4CAF50" />
                <Text className="text-black font-poppins-regular ml-3 mt-1">
                  Informasi Perusahaan
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Keamanan")}
              className=" w-full py-6 px-6 flex-row justify-between items-center">
              <View className="flex-row items-center">
                <IonIcons
                  name="shield-checkmark-sharp"
                  size={29}
                  color="#FF9800"
                />
                <Text className="text-black font-poppins-regular ml-3 mt-1">
                  Ganti Password
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="black" />
            </TouchableOpacity>

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
                <Icon name="log-out" size={29} color="red" />
                <Text className="text-red-500 font-poppins-regular ml-3">
                  Logout
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="red" />
            </TouchableOpacity>
            <View className="w-full h-px bg-gray-300 mt-1" />
            <View className="flex-end">
              <View className="top-20 items-center justify-center flex-end">
                <Text className="flex-end">
                  <FooterText />
                </Text>
              </View>
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
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
      }}
      className="w-10/12">
      <Image
        source={require('../../../assets/icons/arrowRed.png')} // Ganti dengan path ke gambar Anda
        style={{
          width: 95, // Sesuaikan ukuran gambar
          height: 100, // Sesuaikan ukuran gambar
          marginBottom: 15,
        }}
      />

      <Text
        style={{
          fontSize: 16,
          marginBottom: 7,
          fontFamily: "Poppins-Bold",
          color: "black",
        }}>
        Logout
      </Text>
      <Text
        style={{
          fontSize: 16,
          marginBottom: 7,
          fontFamily: "Poppins-SemiBold",
          color: "black",
        }}>
        Yakin ingin keluar?
      </Text>

      <View
        style={{
          width: "100%",
          marginBottom: 15,
        }}
      />

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: "#ececec",
            borderRadius: 5,
            marginRight: 10,
          }}>
          <Text
            style={{
              color: "#4f4f4f",
              fontFamily: "Poppins-SemiBold",
            }}>
            Batal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={confirmLogout}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: "#ffcbd1",
            borderRadius: 5,
          }}>
          <Text
            style={{
              color: "#de0a26",
              fontFamily: "Poppins-SemiBold",
            }}>
            Ya, Keluar
          </Text>
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
          </View>
        </View>

      </>
    </ImageBackground>
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