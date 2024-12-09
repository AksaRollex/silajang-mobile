import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Linking, Dimensions, StyleSheet, Image, ImageBackground,
} from "react-native";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Feather";
import IonIcons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TextFooter } from "../components/TextFooter";

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
                        className="rounded-full  bg-gray-300 items-center justify-center w-28 h-28"
                        style={{ borderWidth: 2, borderColor: "#E2E8F0" }}
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
                <View className="flex-col align-center justify-center mx-2 mt-14">
                <View className="flex flex-row items-center mb-2 justify-center">
                  {/* Nama User */}
                  <Text className="text-[16px] text-black font-poppins-semibold mr-2 mt-[0.5px]">
                    {userData?.nama}
                  </Text>
                  
                    <View className="items-center">
                      <MaterialIcons name="check-decagram" size={22} color="#312e81"  />
                    </View>
                </View>

                  <Text className="text-[13px] text-gray-500 font-poppins-regular text-center ">
                    {userData?.email}
                  </Text>
                  <Text className="text-[13px] text-gray-500 font-poppins-regular text-center ">
                    {userData?.phone}
                  </Text>
                  <Text className="text-[13px] text-gray-500 font-poppins-regular text-center mt-1">
                    ( {userData?.golongan?.nama} )
                  </Text>
                </View>
                <View className="w-full h-[2px] bg-gray-300 mt-3" />
              </>
            ) : (
              <View></View>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate("Informasi")}
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
            >
              <View className="flex-row items-center">
                <Icon name="log-out" size={20} color="red" />
                <Text className="text-red-500 font-poppins-regular ml-3">
                  Logout
                </Text>
              </View>
              <Icon name="chevron-right" size={21} color="red" />
            </TouchableOpacity>
            <View className="w-full h-[1.5px] bg-gray-300 mt-1" />
            <View className="justify-self-center">
              <View className="top-20 items-center justify-center flex-end">
                <Text className="self-center">
                </Text>
              </View>
            </View>
            <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
                <IonIcons size={40} color="#f43f5e" name="log-out-outline" />
              </View>

              <Text className="text-xl font-poppins-semibold text-black mb-3">
                Konfirmasi Logout
              </Text>

              <View className="w-full h-px bg-gray-200 mb-4" />

              <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
                Apakah anda yakin ingin logout?
              </Text>

              <View className="flex-row w-full justify-between">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 mr-3 bg-gray-100 py-3 rounded-xl items-center"
                >
                  <Text className="text-gray-700 font-poppins-medium">Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmLogout}
                  className="flex-1 ml-3 bg-red-500 py-3 rounded-xl items-center"
                >
                  <Text className="text-white font-poppins-medium">Ya, Logout</Text>
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