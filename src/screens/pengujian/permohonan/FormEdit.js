import * as React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
} from "react-native";
import axios from "@/src/libs/axios";
import { useForm, Controller } from "react-hook-form";
import { Button, Colors, TextField } from "react-native-ui-lib";
import Back from "../../components/Back";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { memo, useEffect, useState } from "react";
import IonIcons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";

const EditPermohonan = ({ route, navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

        setTimeout(() => {
          navigation.navigate("Permohonan");
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
    console.log("Submitting data:", data);
    update(data);
  };

  return (
    <>
      <View className="bg-[#ececec] w-full h-full p-3">
        <View className="rounded-3xl bg-[#fff] w-full h-full ">
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
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
              <IonIcons size={40} color="#95bb72" name="checkmark-done-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Data Berhasil Diperbarui !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              Pastikan data sudah benar 
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
              <IonIcons size={40} color="#f43f5e" name="close-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Gagal Memperbarui Data !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              {errorMessage}
            </Text>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
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
    color: "#666",
  },
  errorButton: {
    backgroundColor: "#FF4B4B",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  errorButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 15,
  },
});

export default memo(EditPermohonan);
