import React, { memo } from "react";
import { View, Text, Button, TextField } from "react-native-ui-lib";
import { ScrollView } from "react-native-gesture-handler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import IonIcon from "react-native-vector-icons/Ionicons";

export default memo(function form({ route, navigation }) {
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { data, isLoading: isLoadingData } = useQuery(
    ["radius-pengambilan", uuid],
    () =>
      uuid
        ? axios
            .get(`/master/radius-pengambilan/${uuid}/edit`)
            .then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue(
            "radius",
            new Intl.NumberFormat("id-ID", { style: "decimal" }).format(
              data.radius,
            ),
          ),
            setValue("nama", data.nama),
            setValue(
              "harga",
              new Intl.NumberFormat("id-ID", { style: "decimal" }).format(
                data.harga,
              ),
            );
        }
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to laod data",
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
          ? `/master/radius-pengambilan/${uuid}/update`
          : "/master/radius-pengambilan/store",
        data,
      ),
    {
      onSuccess: () => {
        console.log("berhasil");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid ? "Sukses update data" : "Sukses menambahkan data",
        });
        queryClient.invalidateQueries(["/master/radius-pengambilan"]);
        navigation.navigate("RadiusPengambilan");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to update data",
        });
        console.error(error);
      },
    },
  );

  const formattedRupiah = value => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

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
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: "#fff" }}>
        <IonIcon
          name="arrow-back-outline"
          onPress={() => navigation.goBack()}
          size={25}
          color="#312e81"
        />
        <Text className="text-lg font-poppins-semibold">
          {data ? "Edit Radius Pengambilan" : "Tambah Radius Pengambilan"}
        </Text>
      </View>
      <View className="bg-white rounded m-3">
        <View className="p-5 flex-col space-y-4">
          <Text className="text-lg mb-2 font-poppins-semibold">Radius</Text>
          <Controller
            control={control}
            name="radius"
            rules={{
              required: "radius harus diisi",
              pattern: {
                value: /^[0-9]+$/,
                message: "radius harus berupa angka",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextField
                style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Radius"
                value={value}
                onChangeText={text => {
                  const formattedValue = text.replace(/[^0-9]/g, "");
                  onChange(formattedValue);
                }}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                enableErrors
              />
            )}
          />
          {errors.radius && (
            <Text className="text-red-500">{errors.radius.message}</Text>
          )}
          <Text className="text-lg mb-2 font-poppins-semibold">Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "nama harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Nama"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                enableErrors
              />
            )}
          />
          {errors.nama && (
            <Text className="text-red-500">{errors.nama.message}</Text>
          )}
          <Text className="text-lg mb-2 font-poppins-semibold">Harga</Text>
          <Controller
            control={control}
            name="harga"
            rules={{
              required: "Harga harus diisi",
              pattern: {
                value: /^[0-9.]*$/,
                message: "Harga harus berupa angka",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextField
                style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Harga"
                value={value}
                onChangeText={text => {
                  const formattedValue = formattedRupiah(text);
                  onChange(formattedValue);
                }}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                enableErrors
                keyboardType="numeric"
              />
            )}
          />
          {errors.harga && (
            <Text className="text-red-500">{errors.harga.message}</Text>
          )}
          <Button
            labelStyle={{ fontFamily: "Poppins-SemiBold" }}
            label="Simpan"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            className="rounded-md bg-indigo-800"
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
});
