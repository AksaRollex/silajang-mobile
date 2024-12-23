import { View, Text, Button, TextField } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import React, { memo } from "react";
import { ActivityIndicator } from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import IonIcon from "react-native-vector-icons/Ionicons";
import BackButton from "@/src/screens/components/BackButton";

export default memo(function Form({ route, navigation }) {
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { data, isLoading: isLoadingData } = useQuery(
    ["metode", uuid],
    () =>
      uuid
        ? axios
            .get(`/master/acuan-metode/${uuid}/edit`)
            .then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("nama", data.nama);
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

  const queryClient = useQueryClient();

  const { mutate: createOrUpdate, isLoading } = useMutation(
    data =>
      axios.post(
        uuid
          ? `/master/acuan-metode/${uuid}/update`
          : "/master/acuan-metode/store",
        data,
      ),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid ? "Sukses update data" : "Sukses menambahkan data",
        });
        queryClient.invalidateQueries(["/master/acuan-metode"]);
        navigation.navigate("Metode");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: uuid ? "Failed to update data" : "Failed to create data",
        });
        console.error(error);
      },
    },
  );

  const onSubmit = data => {
    createOrUpdate(data);
  };

  if (isLoadingData && uuid) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] h-full">
      <View
        className="flex-row items-center justify-between py-2.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: "#fff" }}>
          <IonIcon
            name="arrow-back-outline"
            onPress={() => navigation.goBack()}
            size={25}
            color="#312e81"
          />
          <Text className="text-lg font-poppins-semibold ml-3">
            {data ? "Edit Metode" : "Tambah Metode"}
          </Text> 
      </View>
      <View className="bg-white rounded-md m-3">
        <View className="p-5">
          <Text className="mb-3 text-lg font-poppins-semibold">Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "Nama is required" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Nama Metode"
                enableErrors
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.nama && (
            <Text className="text-red-500">{errors.nama.message}</Text>
          )}
          <Button
            labelStyle={{ fontFamily: "Poppins-Regular" }}
            label="Simpan"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            className="rounded-md bg-indigo-800 mt-4"
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
});
