import { Text, View, Button, TextField } from "react-native-ui-lib";
import React, { memo, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import Select2 from "@/src/screens/components/Select2";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import { ActivityIndicator } from "react-native-paper";

export default memo(function form({ route, navigation }) {
  const [kotaKab, setKotaKab] = useState([]);
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { data, isLoading: isLoadingData } = useQuery(
    ["kecamatan", uuid],
    () =>
      uuid
        ? axios.get(`/master/kecamatan/${uuid}/edit`).then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("nama", data.nama);
          setValue('kab_kota_id', data.kab_kota_id)
        }
      },
      onError: error => {
        console.error(error);
        Toast({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to load data",
        });
      },
    },
  );
  useQuery(
    ["kota-kab", uuid],
    () => axios.get("/master/kota-kabupaten").then(res => res.data.data),
    {
      onSuccess: data => setKotaKab(data),
    },
  );

  const formattedKabKota = kotaKab?.map(item => ({
    value: item.id,
    label: item.nama,
  }));

  const queryClient = useQueryClient();

  const { mutate: createOrUpdate, isLoading } = useMutation(
    data =>
      axios.post(
        uuid ? `/master/kecamatan/${uuid}/update` : "/master/kecamatan/store",
        data,
      ),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid ? "Data updated successfully" : "Success create data",
        });
        queryClient.invalidateQueries(["/master/kecamatan"]);
        navigation.navigate("Kecamatan");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "error",
          text2: uuid ? "Failed to update data" : "Failed to create data",
        });
        console.error(error);
      },
    },
  );

  const onSubmit = data => {
    createOrUpdate(data);
  };

  if (isLoading && uuid) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] h-full">
      <View className="bg-white rounded m-3">
        <View className="flex-row justify-between mx-3 mt-4">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-xl font-poppins-semibold">
            {data ? "Edit Kecamatan" : "Tambah Kecamatan"}
          </Text>
        </View>
        <View className="p-5">
          <Text className="mb-3 text-lg font-poppins-semibold text-black">Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "Nama harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="Masukkan Nama Kota/Kabupaten"
                enableErrors
                className="py-3 px-5 rounded border-[1px] border-gray-700 font-poppins-regular"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.nama && (
            <Text className="text-red-500">{errors.nama.message}</Text>
          )}

          <Text className="mb-3 text-lg font-poppins-semibold">Kota/Kabupaten</Text>
          <Controller
            control={control}
            name="kab_kota_id"
            rules={{ required: "kota/kabupaten harus diisi" }}
            render={({ field: { onChange, value }}) => (
              <Select2
                onChangeValue={value => {
                  onChange(value);
                }}
                value={value}
                items={formattedKabKota}
                placeholder={{ label: "Pilih Kota/Kabupaten", value: null }}
              />
            )}
          />
          {errors.kab_kota_id && (
            <Text className="text-red-500">{errors.kab_kota_id.message}</Text>
          )}
          <Button
            labelStyle={{ fontFamily: "Poppins-Medium" }}
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
