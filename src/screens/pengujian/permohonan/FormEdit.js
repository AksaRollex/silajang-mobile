import * as React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal } from "react-native";
import axios from "@/src/libs/axios";
import { useForm, Controller } from "react-hook-form";
import { Button, Colors, TextField } from "react-native-ui-lib";
import Back from "../../components/Back";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { memo, useEffect, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";

const EditPermohonan = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { uuid } = route.params || {};
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const queryClient = useQueryClient();
  const toastConfig = {
    success: () => (
      <>
        <View className="relative">
          <View className="bg-[#dddddd] mx-6 p-4 rounded-xl min-h-16 shadow-md">
            <View className="flex-1 pr-8">
              <Text className="text-green-500 text-sm font-poppins-semibold mb-1">
                Data Berhasil Diperbarui !
              </Text>
              <Text className="text-gray-600 text-xs font-poppins-regular">
                Silahkan Untuk Memastikan Bahwa Data Kamu Sudah Sesuai !
              </Text>
            </View>
          </View>
          <View className="absolute right-1 top-1/4 -translate-y-1/2">
            <Entypo name="new-message" size={35} color="#ffa500" />
          </View>
        </View>
      </>
    ),

    error: ({ text2 }) => (
      <View className="bg-white mx-4 mt-2 p-4 rounded-xl min-h-16 flex-row items-center justify-between shadow-md">
        <View className="flex-1 mr-3">
          <Text className="text-red-500 text-sm font-semibold mb-1">Error</Text>
          <Text className="text-gray-600 text-xs">{text2}</Text>
        </View>
        <View className="w-6 h-6 justify-center items-center">
          <IonIcons name="close-circle" size={24} color="#EF4444" />
        </View>
      </View>
    ),
  };
  // FETCH DATA
  const { data, isLoading: isLoadingData } = useQuery(
    ["permohonan", uuid],
    () =>
      uuid
        ? axios.get(`/permohonan/${uuid}/edit`).then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("industri", data.industri);
          setValue("alamat", data.alamat);
          setValue("kegiatan", data.kegiatan);
          // setValue("keterangan", data.keterangan);
        }
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load data",
        });
        console.error(error);
      },
    },
  );

  // UPDATE DATA
  const { mutate: update, isLoading: isUpdating } = useMutation(
    data => axios.post(`/permohonan/${uuid}/update`, data),
    {
      onSuccess: () => {
        setModalVisible(true); // Tampilkan modal dulu
        queryClient.invalidateQueries(["/permohonan"]);

        Toast.show({
          type: "success",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        // Tunggu sebentar sebelum navigasi
        setTimeout(() => {
          navigation.navigate("Permohonan");
        }, 2000);
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to update data",
        });
        console.error(error.response?.data || error);
      },
    },
  );

  const onSubmit = data => {
    console.log("Submitting data:", data);
    update(data);
  };

  return (
    <>
      <View className="bg-[#ececec] w-full h-full p-3">
        <View className="bg-[#f8f8f8] w-full h-full rounded-3xl">
          <View className="flex-row  p-3 ">
            <Back
              size={30}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
              style={{
                borderWidth: 0.5,
                padding: 4,
                borderColor: "#f8f8f8",
                borderRadius: 8,
              }}
            />
            <Text className="font-poppins-semibold text-black text-2xl mt-1 ">
              Edit Permohonan
            </Text>
          </View>
          <View className="py-4 px-3 ">
            <Controller
              name="industri"
              control={control}
              rules={{ required: "Industri tidak boleh kosong" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Nama industri
                  </Text>
                  <TextField
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    placeholder="Masukkan Nama Industri"
                    placeholderTextColor={"grey"}
                    onChangeText={onChange}
                    value={value}
                    error={errors.industri?.message}
                  />
                </View>
              )}
            />
            {errors.industri && (
              <Text
                style={{ color: "red" }}
                className=" mb-2 lowercase font-poppins-regular">
                {errors.industri.message}
              </Text>
            )}

            <Controller
              name="alamat"
              control={control}
              rules={{ required: "Alamat tidak boleh kosong" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1  text-black">
                    Alamat industri
                  </Text>
                  <TextField
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    placeholder="Masukkan Alamat Industri"
                    placeholderTextColor={"grey"}
                    onChangeText={onChange}
                    value={value}
                    error={errors.alamat?.message}
                  />
                </View>
              )}
            />
            {errors.alamat && (
              <Text
                style={{ color: "red" }}
                className="lowercase font-poppins-regular">
                {errors.alamat.message}
              </Text>
            )}

            <Controller
              name="kegiatan"
              control={control}
              rules={{ required: "Kegiatan tidak boleh kosong" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1  text-black">
                    Kegiatan Industri
                  </Text>
                  <TextField
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    placeholder="Masukkan Kegiatan Industri"
                    placeholderTextColor={"grey"}
                    onChangeText={onChange}
                    value={value}
                    error={errors.kegiatan?.message}
                  />
                </View>
              )}
            />
            {errors.kegiatan && (
              <Text
                style={{ color: "red" }}
                className=" lowercase font-poppins-regular">
                {errors.kegiatan.message}
              </Text>
            )}

            <Button
              onPress={handleSubmit(onSubmit)}
              isLoading={isUpdating}
              className="p-3 rounded-2xl mt-4"
              style={{ backgroundColor: Colors.brand }}>
              <TouchableOpacity>
                <Text className="text-white text-center text-base font-poppins-semibold">
                  SIMPAN
                </Text>
              </TouchableOpacity>
            </Button>
          </View>
        </View>
      </View>
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ececec",
  },

  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: Colors.brand,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    height: "35%",
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    fontWeight: "bold",
    marginBottom: rem(1.5),
    marginTop: rem(1),
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  toastContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    minHeight: 64,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
    fontFamily: "Poppins-SemiBold",
  },
  message: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Poppins-Regular",
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    borderLeftColor: "#FF4444",
  },
  errorTitle: {
    color: "#FF4444",
  },
  errorMessage: {
    color: "#666666",
  },
});

export default memo(EditPermohonan);
