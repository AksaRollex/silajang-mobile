import * as React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Modal } from "react-native";
import axios from "@/src/libs/axios";
import { useForm, Controller } from "react-hook-form";
import { Button, Colors, TextField } from "react-native-ui-lib";
import Back from "../../components/Back";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import LottieView from "lottie-react-native";
import { memo, useEffect, useState } from "react";

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

        // Tunggu sebentar sebelum navigasi
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("Permohonan");
        }, 2000);
      },
      onError: error => {
        setErrorMessage(error.response?.data?.message || "Gagal memperbarui data");
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
        <View className="flex-row  p-3 ">
          <Back
            size={30}
            color={"black"}
            action={() => navigation.goBack()}
            className="mr-5 "
            style={{
              padding: 4,
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
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <Image 
              source={require("@/assets/images/cek.png")}
              style={styles.lottie}
            />
            {/* <LottieView
              source={require("../../../../assets/lottiefiles/success-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            /> */}
            <Text style={styles.successTextTitle}>
              Data berhasil diperbarui
            </Text>
            <Text style={styles.successText}>
              Silahkan memastikan bahwa data yang anda kirim telah benar !
            </Text>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={errorModalVisible}>
        <View style={styles.overlayView}>
          <View style={[styles.successContainer, styles.errorContainer]}>
            <Image 
              source={require("@/assets/images/error.png")}
              style={styles.lottie}
              />
              <Text style={[styles.successTextTitle, styles.errorTitle]}>
                Gagal memperbarui data
              </Text>
              <Text style={[styles.successText, styles.errorText]}>
                {errorMessage}
              </Text>
              {/* <TouchableOpacity 
                style={styles.errorButton}
                onPress={() => setErrorModalVisible(false)}>
                  <Text style={styles.errorButtonText}>Tutup</Text>
              </TouchableOpacity> */}
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
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
    fontFamily: "Poppins-Bold",
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
  errorContainer: {
  },
  errortitle: {
    color: '#FF4B4B',
  },
  errorText: {
    color: '#666',
  },
  errorButton: {
    backgroundColor: '#FF4B4B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  errorButtonText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },  
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingHorizontal: 15,
  },
});

export default memo(EditPermohonan);
