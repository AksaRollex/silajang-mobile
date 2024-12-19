import { Text, View, Button, TextField } from "react-native-ui-lib";
import React, { memo, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ScrollView } from "react-native-gesture-handler";
import Select2 from "@/src/screens/components/Select2";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import { ActivityIndicator } from "react-native-paper";
import IonIcon from "react-native-vector-icons/Ionicons";

export default memo(function form({ route, navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [kotaKab, setKotaKab] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [editData, setEditData] = useState(null);
  const { uuid } = route.params || {};

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  // Fungsi fetch kecamatan
  const fetchKecamatan = async kotaKabId => {
    if (!kotaKabId) return;

    try {
      const response = await axios.get(
        `/wilayah/kota-kabupaten/${kotaKabId}/kecamatan`,
      );
      if (response.data && response.data.data) {
        const formattedKecamatan = response.data.data.map(item => ({
          title: item.nama,
          value: item.id,
        }));
        setKecamatan(formattedKecamatan);
      }
    } catch (error) {
      console.error("Error fetching kecamatan:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal memuat data kecamatan",
      });
    }
  };

  // Fetch initial data (kota/kabupaten)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch kota/kabupaten
        const kotaKabResponse = await axios.get("/master/kota-kabupaten");
        const formattedKotaKab = kotaKabResponse.data.data.map(item => ({
          title: item.nama,
          value: item.id,
        }));
        setKotaKab(formattedKotaKab);

        // If in edit mode, fetch kelurahan data
        if (uuid) {
          setIsLoading(true);
          const kelurahanResponse = await axios.get(
            `/master/kelurahan/${uuid}/edit`,
          );
          const data = kelurahanResponse.data.data;
          setEditData(data);

          // Set form values
          setValue("nama", data.nama);
          setValue("kab_kota_id", data.kab_kota_id);

          // Fetch kecamatan for the selected kota/kabupaten
          await fetchKecamatan(data.kab_kota_id);

          // Set kecamatan value after fetching kecamatan data
          setValue("kecamatan_id", data.kecamatan_id);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Gagal memuat data",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [uuid]);

  const handleSubmitForm = async data => {
    setIsLoading(true);
    try {
      await axios.post(
        uuid ? `/master/kelurahan/${uuid}/update` : "/master/kelurahan/store",
        data,
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: uuid ? "Berhasil update data" : "Berhasil tambah data",
      });
      navigation.navigate("Kelurahan");
    } catch (error) {
      console.error("Error submitting form:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: uuid ? "Gagal update data" : "Gagal tambah data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
          {uuid ? "Edit Kelurahan" : "Tambah Kelurahan"}
        </Text>
      </View>
      <View className="bg-white rounded m-3">
        <View className="p-5">
          <Text className="mb-3 text-lg font-poppins-semibold">Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "Nama harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="Masukkan Nama Kelurahan"
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

          <Text className="mb-2 text-lg font-poppins-semibold">
            Kota/Kabupaten
          </Text>
          <Controller
            control={control}
            name="kab_kota_id"
            rules={{ required: "Kota/Kabupaten harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <Select2
                onSelect={async newValue => {
                  onChange(newValue);
                  setValue("kecamatan_id", null); // Reset kecamatan
                  setKecamatan([]); // Clear kecamatan list
                  if (newValue) {
                    await fetchKecamatan(newValue);
                  }
                }}
                defaultValue={value}
                data={kotaKab}
                placeholder="Pilih kota/kabupaten"
              />
            )}
          />
          {errors.kab_kota_id && (
            <Text className="text-red-500">{errors.kab_kota_id.message}</Text>
          )}

          <Text className="mb-2 text-lg font-poppins-semibold mt-2">Kecamatan</Text>
          <Controller
            control={control}
            name="kecamatan_id"
            rules={{ required: "Kecamatan harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <Select2
                onSelect={onChange}
                defaultValue={value}
                data={kecamatan}
                placeholder= "Pilih kecamatan"
              />
            )}
          />
          {errors.kecamatan_id && (
            <Text className="text-red-500">{errors.kecamatan_id.message}</Text>
          )}

          <Button
            labelStyle={{ fontFamily: "Poppins-Medium" }}
            label={isLoading ? "Loading..." : "Simpan"}
            onPress={handleSubmit(handleSubmitForm)}
            disabled={isLoading}
            className="mt-4 bg-[#312e81] p-3 rounded"
          />
        </View>
      </View>
    </View>
  );
});
