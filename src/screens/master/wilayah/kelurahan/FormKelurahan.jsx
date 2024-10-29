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
  const [kecamatan, setKecamatan] = useState([]);
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  const selectedKotaId = watch("kab_kota_id");

  const { data, isLoading: isLoadingData } = useQuery(
    ["kelurahan", uuid],
    () =>
      uuid
        ? axios.get(`/master/kelurahan/${uuid}/edit`).then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("nama", data.nama);
          setValue('kab_kota_id', data.kab_kota_id);
          setValue('kecamatan_id', data.kecamatan_id);
        }
      },
      onError: error => {
        console.error(error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to load data",
        });
      },
    },
  );

  // Query untuk get data kota/kabupaten
  const { isLoading: isLoadingKota } = useQuery(
    ["kota-kab"],
    () => axios.get("/master/kota-kabupaten").then(res => res.data.data),
    {
      onSuccess: data => setKotaKab(data),
      onError: error => {
        console.error('Error fetching kota:', error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load kota data",
        });
      }
    },
  );

  const { isLoading: isLoadingKecamatan } = useQuery(
    ["kecamatan", selectedKotaId],
    async () => {
      if (!selectedKotaId) return [];
      try {
        // Test GET first; if 405 persists, use POST
        const response = await axios.get(`/master/kecamatan`, { params: { kota_id: selectedKotaId } });
        return response.data.data;
      } catch (error) {
        if (error.response && error.response.status === 405) {
          const response = await axios.post(`/master/kecamatan`, { kota_id: selectedKotaId });
          return response.data.data;
        }
        console.error('Error fetching kecamatan:', error.response || error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load kecamatan data",
        });
        return [];
      }
    },
    {
      enabled: !!selectedKotaId,
      onSuccess: data => {
        setKecamatan(data);
        const currentKecamatanId = watch('kecamatan_id');
        if (currentKecamatanId && !data.find(item => item.id === currentKecamatanId)) {
          setValue('kecamatan_id', null);
        }
      },
      retry: false,
    }
  );
  
  

  // Effect untuk membersihkan data kecamatan ketika kota berubah
  useEffect(() => {
    if (selectedKotaId) {
      setKecamatan([]); // Clear kecamatan list
      setValue('kecamatan_id'); // Reset selection
    }
  }, [selectedKotaId, setValue]);

  const formattedKabKota = kotaKab?.map(item => ({
    value: item.id,
    label: item.nama,
  })) || [];

  const formattedKecamatan = kecamatan?.map(item => ({
    value: item.id,
    label: item.nama,
  })) || [];

  const queryClient = useQueryClient();

  const { mutate: createOrUpdate, isLoading } = useMutation(
    data =>
      axios.post(
        uuid ? `/master/kelurahan/${uuid}/update` : "/master/kelurahan/store",
        data,
      ),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid ? "Data updated successfully" : "Success create data",
        });
        queryClient.invalidateQueries(["/master/kelurahan"]);
        navigation.navigate("Kelurahan");
      },
      onError: error => {
        console.error('Submit error:', error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to save data",
        });
      },
    },
  );

  const onSubmit = data => {
    console.log('Submitting data:', data); // Debug log
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
    <ScrollView className="bg-[#ececec] h-full">
      <View className="bg-white rounded m-3">
        <View className="flex-row justify-between mx-3 mt-4">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-xl font-poppins-semibold">
            {data ? "Edit Kecamatan" : "Tambah Kecamatan"}
          </Text>
        </View>
        
        <View className="p-5">
          <Text className="mb-3 text-lg font-semibold">Kota/Kabupaten</Text>
          <Controller
            control={control}
            name="kab_kota_id"
            rules={{ required: "kota/kabupaten harus diisi" }}
            render={({ field: { onChange, value }}) => (
              <Select2
                onChangeValue={value => {
                  console.log('Selected kota:', value); // Debug log
                  onChange(value);
                }}
                value={value}
                items={formattedKabKota}
                placeholder={{ label: "pilih kota/kabupaten", value: null }}
                isLoading={isLoadingKota}
              />
            )}
          />
          {errors.kab_kota_id && (
            <Text className="text-red-500">{errors.kab_kota_id.message}</Text>
          )}

          <Text className="mb-3 text-lg font-semibold">Kecamatan</Text>
          <Controller
            control={control}
            name="kecamatan_id"
            rules={{ required: "kecamatan harus diisi" }}
            render={({ field: { onChange, value }}) => (
              <Select2
                onChangeValue={value => {
                  console.log('Selected kecamatan:', value);
                  onChange(value);
                }}
                value={value}
                items={formattedKecamatan}
                placeholder={{ label: "pilih kecamatan", value: null }}
                isLoading={isLoadingKecamatan}
                disabled={!selectedKotaId || isLoadingKecamatan}
              />
            )}
          />
          {errors.kecamatan_id && (
            <Text className="text-red-500">{errors.kecamatan_id.message}</Text>
          )}
          
          <Text className="mb-3 text-lg font-semibold">Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "Nama harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <TextField
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
            label="Simpan"
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            className="rounded-md bg-indigo-800 mt-4"
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
});