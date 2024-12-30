import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Feather";
import IonIcons from "react-native-vector-icons/Ionicons";
import FooterText from "../components/FooterText";
import DefaultAvatar from "../../../assets/images/avatar.png";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FastImage from "react-native-fast-image";
import Header from "../components/Header";

const { width, height } = Dimensions.get("window");
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

export default function Profile({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const openImageViewer = imageUrl => {
    setSelectedImage(`${process.env.APP_URL}${imageUrl}`);
    setImageViewerVisible(true);
  };

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

  return (
    <View style={styles.container}>
      <ScrollView
        className="flex-col"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}>
        {/* <ImageBackground
          source={require("../../../assets/images/background.png")}
          style={{ flex: 1, resizeMode: "cover" }}>
          <Text className="text-white text-xl font-poppins-bold mx-6 top-20">
            Profil Saya
          </Text>
        </ImageBackground> */}
        <ImageBackground
          source={require("../../../assets/images/background.png")}
          style={{
            height: 180, // Atur tinggi yang tetap
          }}>
          <Header
            navigate={() => {
              navigation.navigate("Profile");
            }}
          />

          {/* <View className="z-50">
            {userData ? (
        
            ) : (
              <View className="h-full flex justify-center">
                <ActivityIndicator size={"large"} color={"#312e81"} />
              </View>
            )}
          </View> */}
        </ImageBackground>

        <View className="flex-1" style={{ marginTop: -50 }}>
          <View
            className="rounded-t-3xl h-full bg-[#F9FAFB] "
            style={{ zIndex: 1 }}>
            {userData ? (
              <>
                <View
                  className="z-50 w-full mt-4"
                  style={{
                    position: "absolute",
                  }}>
                  <TouchableOpacity
                    onPress={() => openImageViewer(userData.photo)}
                    style={{
                      alignSelf: "center",
                    }}>
                    <FastImage
                      className="rounded-full w-28 h-28 border-4 border-[#F9FAFB]"
                      source={
                        userData?.photo
                          ? { uri: `${process.env.APP_URL}${userData.photo}` }
                          : DefaultAvatar
                      }
                      defaultSource={DefaultAvatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  </TouchableOpacity>
                </View>
                <View className="flex-col align-center justify-center mx-2  mt-32">
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
              <View className="top-3 items-center justify-center flex-end">
                <Text className="flex-end">
                  <FooterText />
                </Text>
              </View>
            </View>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}>
              <View className="flex-1 justify-center items-center bg-black/50">
                <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
                  <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
                    <Icon name="log-out" size={50} color="red" />
                  </View>
                  <Text className="text-xl font-poppins-semibold text-black mb-3">
                    Logout
                  </Text>

                  <View className="w-full h-px bg-gray-200 mb-4" />

                  <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
                    Yakin ingin keluar dari akun ini?
                  </Text>
                  <View className="flex flex-row justify-center items-center space-x-3 w-full mt-3 ">
                    <TouchableOpacity
                      className="w-28 h-10 justify-center items-center"
                      onPress={() => {
                        setModalVisible(false);
                      }}
                      style={{
                        backgroundColor: "#d3d2d2",
                        borderRadius: 5,
                        marginTop: 10,
                      }}>
                      <Text className="text-[#343333] font-poppins-semibold ">
                        Tutup
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-28 h-10 justify-center items-center"
                      onPress={() => {
                        confirmLogout();
                      }}
                      style={{
                        backgroundColor: "#ffcbd1",
                        borderRadius: 5,
                        marginTop: 10,
                      }}>
                      <Text className="text-[#de0a26] text-sm font-poppins-semibold ">
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
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
