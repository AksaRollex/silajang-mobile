import React, { useState } from "react";
import { View, StyleSheet, Text, Modal, ScrollView } from "react-native";
import { Colors, Button, TextField } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import axios from "@/src/libs/axios";
import Ionicons from "react-native-vector-icons/Ionicons";
import Back from "../../components/Back";
import IonIcons from "react-native-vector-icons/Ionicons";

import { TouchableOpacity } from "react-native-ui-lib";
import FooterText from "../../components/FooterText";

rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Keamanan = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    isLoading,
    getValues,
  } = useForm();
  const navigation = useNavigation();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordVisible2, setPasswordVisible2] = useState(false);
  const [isPasswordVisible3, setPasswordVisible3] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };
  const togglePasswordVisibility2 = () => {
    setPasswordVisible2(!isPasswordVisible2);
  };
  const togglePasswordVisibility3 = () => {
    setPasswordVisible3(!isPasswordVisible3);
  };

  const queryClient = useQueryClient();

  const updateKeamanan = useMutation(
    data => axios.post("/user/security", data),
    {
      onSuccess: () => {
        setModalVisible(true);
        queryClient.invalidateQueries("/auth");

        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("IndexProfile");
        }, 2000);
      },
      onError: error => {
        setErrorMessage(
          error.response?.data?.message || "Gagal memperbarui data",
        );
        setErrorModalVisible(true);
        setTimeout(() => {
          setErrorModalVisible(false);
        }, 2000);
      },
    },
  );

  const onSubmit = data => {
    if (data.password !== data.password_confirmation) {
      Toast.show({
        type: "error",
        text1: "Konfirmasi password tidak cocok",
      });
      return;
    }
    updateKeamanan.mutate(data);
  };

  return (
    <>
      <View className="bg-[#ececec] w-full h-full p-3">
        <View
          className="bg-[#fff] rounded-3xl px-4 h-full"
          style={{
            elevation: 5,
            shadowColor: "rgba(0, 0, 0, 0.1)",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 2,
          }}>
          <View className="flex-row items-center justify-between py-5">
            <Back
              size={25}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
              style={{
                padding: 4,
              }}
            />
            <Text className="font-poppins-semibold text-black text-lg text-end items-start  mt-1 ">
              Ganti Password
            </Text>
          </View>
          <ScrollView className="w-full h-full">
            <Controller
              control={control}
              name="old_password"
              rules={{ required: "Password Lama Harus Diisi" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="text-black font-poppins-semibold mb-2">
                    Password Lama
                  </Text>
                  <TextField
                    secureTextEntry={!isPasswordVisible}
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.old_password}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "53%",
                    }}>
                    <Ionicons
                      name={
                        isPasswordVisible ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color={Colors.brand}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.old_password && (
              <Text style={{ color: "red" }} className="mb-2 ">
                {errors.old_password.message}
              </Text>
            )}

            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password Baru Harus Diisi",
                minLength: {
                  value: 12,
                  message: "Password minimal 12 karakter",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                  message:
                    "Password harus mengandung huruf kecil, huruf kapital, dan angka",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold my-2 text-black">
                    Password Baru
                  </Text>
                  <TextField
                    mode="outlined"
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    secureTextEntry={!isPasswordVisible2}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.password}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility2}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "57%",
                    }}>
                    <Ionicons
                      name={
                        isPasswordVisible2 ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color={Colors.brand}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password && (
              <Text style={{ color: "red" }} className="mb-2">
                {errors.password.message}
              </Text>
            )}

            <Controller
              control={control}
              name="password_confirmation"
              rules={{
                required: "Konfirmasi Password Baru Harus Diisi",
                validate: value =>
                  value === getValues("password") || "Password tidak cocok",
              }}
              render={({ field: { onChange, value } }) => (
                <View className="mt-2">
                  <Text className="font-poppins-semibold mb-2 text-black">
                    Konfirmasi Password Baru
                  </Text>
                  <TextField
                    mode="outlined"
                    secureTextEntry={!isPasswordVisible3}
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.password_confirmation}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility3}
                    style={{
                      position: "absolute",
                      top: "53%",
                      right: 10,
                    }}>
                    <Ionicons
                      name={
                        isPasswordVisible3 ? "eye-outline" : "eye-off-outline"
                      }
                      size={20}
                      color={Colors.brand}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
            {errors.password_confirmation && (
              <Text style={{ color: "red" }} className="mb-2">
                {errors.password_confirmation.message}
              </Text>
            )}

            <Button
              className="p-3 rounded-3xl my-8"
              backgroundColor={Colors.brand}
              borderRadius={5}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}>
              <Text className="text-white text-center text-base  font-poppins-semibold">
                PERBARUI
              </Text>
            </Button>
            <FooterText />
          </ScrollView>
        </View>
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
                <IonIcons
                  size={40}
                  color="#95bb72"
                  name="checkmark-done-sharp"
                />
              </View>
              <Text className="text-xl font-poppins-semibold text-black mb-3">
                Data Berhasil Dirubah !
              </Text>

              <View className="w-full h-px bg-gray-200 mb-4" />

              <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
                Pastikan Data perusahaan kamu sudah benar / sesuai !
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={errorModalVisible}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
                <IonIcons
                  size={40}
                  color="#95bb72"
                  name="checkmark-done-sharp"
                />
              </View>
              <Text className="text-xl font-poppins-semibold text-black mb-3">
                Data Gagal Dirubah !
              </Text>

              <View className="w-full h-px bg-gray-200 mb-4" />

              <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
                {errorMessage ||
                  "Terjadi kesalahan saat memperbarui data. Silahkan coba lagi !"}
              </Text>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },

  successContainer: {
    alignItems: "center",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    marginBottom: rem(0.5),
    marginTop: rem(1),
    color: "#77DD77",
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  errorContainer: {},
  errortitle: {
    color: "#FF4B4B",
  },
  errorText: {
    color: "#fff",
  },
});

export default Keamanan;
