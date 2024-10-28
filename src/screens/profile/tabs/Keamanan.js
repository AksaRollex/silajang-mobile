import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { Colors, Button, TextField } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from '@tanstack/react-query';
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import axios from "@/src/libs/axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Back from "../../components/Back";
import { API_URL } from "@env";

import { TouchableOpacity } from "react-native-ui-lib";

rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Keamanan = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    isLoading,
  } = useForm();
  const navigation = useNavigation();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordVisible2, setPasswordVisible2] = useState(false);
  const [isPasswordVisible3, setPasswordVisible3] = useState(false);

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
    data => axios.post(`${API_URL}user/security`, data),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Password berhasil diperbarui",
        });
        queryClient.invalidateQueries("/auth");
        navigation.navigate("IndexProfile");
      },
      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message || "Gagal memperbarui password",
        });
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
      <View className="w-full">
        <View
          className="flex-row mb-4 p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className="font-bold text-white text-lg ">Ganti Password</Text>
        </View>
      </View>
      <View className="bg-[#ececec] w-full h-full px-3 py-1 ">
        <View className="bg-[#f8f8f8] py-4 px-3 rounded-md mb-6">
          <Controller
            control={control}
            name="old_password"
            rules={{ required: "Password Lama Harus Diisi" }}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="text-black font-sans font-bold mb-2">
                  Password Lama
                </Text>
                <TextField
                  secureTextEntry={!isPasswordVisible}
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
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
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
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
              minLength: { value: 12, message: "Password minimal 12 karakter" },
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold my-2 text-black">
                  Password Baru
                </Text>
                <TextField
                  mode="outlined"
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
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
            rules={{ required: "Konfirmasi Password Baru Harus Diisi" }}
            render={({ field: { onChange, value } }) => (
              <View className="mt-2">
                <Text className="font-sans font-bold mb-2 text-black">
                  Konfirmasi Password Baru
                </Text>
                <TextField
                  mode="outlined"
                  secureTextEntry={!isPasswordVisible3}
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
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
            className="p-2 rounded-sm mt-2"
            backgroundColor={Colors.brand}
            borderRadius={5}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}>
            <Text className="text-white text-center text-base font-bold font-sans">
              PERBARUI
            </Text>
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({});

export default Keamanan;
