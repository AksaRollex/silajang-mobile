import * as React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import axios from "@/src/libs/axios";
import { useForm, Controller } from "react-hook-form";
import { Button, Colors, TextField } from "react-native-ui-lib";
import Back from "../../components/Back";
import Header from "../../components/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { memo, useEffect } from "react";

const EditPermohonan = ({ route, navigation }) => {
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
    () => axios.get(`/permohonan/${uuid}/edit`).then(res => res.data.data),
    {
      enabled: !!uuid,
      // MENAMPILKAN DATA -> REQUEST DATA YANG DI TAMPILKAN
      onSuccess: data => {
        if (data) {
          setValue("industri", data.industri);
          setValue("alamat", data.alamat);
          setValue("kegiatan", data.kegiatan);
          setValue("keterangan", data.keterangan);
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
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Data updated successfully",
        });
        queryClient.invalidateQueries(["permohonan"]);
        navigation.navigate("Permohonan");
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
      <Header />
      <View className="bg-[#ececec] w-full h-full p-7 ">
        <Back size={24} action={() => navigation.goBack()} className="mr-2" />

        <Controller
          name="industri"
          control={control}
          rules={{ required: "Industri is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              className="p-3 mt-5 bg-[#bebcbc] rounded-md"
              placeholder="Industri"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.industri?.message}
            />
          )}
        />

        <Controller
          name="alamat"
          control={control}
          rules={{ required: "Alamat is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              className="p-3 mt-5 bg-[#bebcbc] rounded-md"
              placeholder="Alamat"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.alamat?.message}
            />
          )}
        />

        <Controller
          name="kegiatan"
          control={control}
          rules={{ required: "Kegiatan is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              className="p-3 mt-5 bg-[#bebcbc] rounded-md"
              placeholder="Kegiatan"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              error={errors.kegiatan?.message}
            />
          )}
        />

        <Controller
          name="keterangan"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              className="p-3 mt-5 bg-[#bebcbc] rounded-md"
              placeholder="Keterangan"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          isLoading={isUpdating}
          className="p-3 rounded-lg my-4"
          style={{ backgroundColor: Colors.brand }}>
          <TouchableOpacity>
            <Text className="text-white text-center text-lg font-bold font-sans">
              Simpan Data
            </Text>
          </TouchableOpacity>
        </Button>
      </View>
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
});

export default memo(EditPermohonan);
