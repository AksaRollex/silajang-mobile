import { View, Text, TextField, Button } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { memo } from "react";
import { ActivityIndicator } from "react-native-paper";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import IonIcon from "react-native-vector-icons/Ionicons";

export default memo(function Form({ route, navigation }) {
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { data, isLoading: isLoadingData } = useQuery(
    ["pengawetan", uuid],
    () =>
      uuid
        ? axios
            .get(`/master/pengawetan/${uuid}/edit`)
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
          text2: "Failed to Load Data",
        });
        console.error(error);
      },
    },
  );
  const queryClient = useQueryClient();

  const { mutate: createOrUpdate, isLoading } = useMutation(
    data =>
      axios.post(
        uuid ? `/master/pengawetan/${uuid}/update` : "/master/pengawetan/store",
        data,
      ),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid
            ? "Data updated successfully"
            : "Data created successfully",
        });
        queryClient.invalidateQueries(["/master/pengawetan"]),
          navigation.navigate("Pengawetan");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: uuid ? "Failed update data" : "Failed to create data",
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
      <View className="h-full flex- justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] h-full">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: "#fff" }}>
        <IonIcon
          name="arrow-back-outline"
          onPress={() => navigation.goBack()}
          size={25}
          color="#312e81"
        />
        <Text className="text-lg font-poppins-semibold ml-3">
          {data ? "Edit Pengawetan" : "Tambah Pengawetan"}
        </Text>
      </View>
      <View className="rounded bg-white m-3">
        <View className="p-5">
          <Text className="text-lg mb-3 font-poppins-semibold text-black">
            Nama
          </Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "Nama is Required" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Nama"
                enableErrors
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.name && (
            <Text className="text-red-500">{errors.nama.message}</Text>
          )}
          <Button
            labelStyle={{ fontFamily: "Poppins-Medium" }}
            label="Simpan"
            isLoading={isLoading}
            onPress={handleSubmit(onSubmit)}
            className="rounded-md bg-indigo-800 mt-4"
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
});
