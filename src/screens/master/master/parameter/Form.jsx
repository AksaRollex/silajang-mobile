import React, { useState, memo, useEffect } from "react";
import { View, Text, Button, TextField } from "react-native-ui-lib";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ActivityIndicator } from "react-native";
import { Controller, useForm } from "react-hook-form";
import Select2 from "@/src/screens/components/Select2";
import axios from "@/src/libs/axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import MultiSelect from "react-native-multiple-select";

export default memo(function Form({ route, navigation }) {
  const [jenisParameter, setJenisParameter] = useState([]);
  const [pengawetan, setPengawetan] = useState([]);
  const [selectedJenisParameter, setSelectedJenisParameter] = useState([]);
  const [selectedPengawetan, setSelectedPengawetan] = useState([]);
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const onSelectedItemsChange = selectedItems => {
    setSelectedPengawetan(selectedItems);
    setValue("pengawetan", selectedItems);
  };

  const { data, isLoading: isLoadingData } = useQuery(
    ["parameter", uuid],
    () =>
      uuid
        ? axios.get(`/master/parameter/${uuid}/edit`).then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("nama", data.nama);
          setValue("keterangan", data.keterangan);
          setValue("jenis_parameter", data.jenis_parameter_id);
          setValue("metode", data.metode);
          setValue(
            "harga",
            data.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          );
          setValue("pengawetan", data.pengawetan_ids);
          setSelectedPengawetan(data.pengawetan_ids);
          setValue("satuan", data.satuan);
          setValue("mdl", data.mdl);
          setValue("is_akreditasi", data.is_akreditasi);
          setValue("is_dapat_diuji", data.is_dapat_diuji);
        }
      },
    },
  );

  const fetchParameter = useQuery(
    ["jenis-parameter"],
    () => axios.get("/master/jenis-parameter").then(res => res.data.data),
    {
      onSuccess: data => setJenisParameter(data),
    },
  );

  const fetchPengawetan = useQuery(
    ["pengawetan"],
    () => axios.get("/master/pengawetan").then(res => res.data.data),
    {
      onSuccess: data => setPengawetan(data),
    },
  );

  const formattedJenisParameter = jenisParameter.map(item => ({
    label: item.nama,
    value: item.id,
  }));
  const formattedPengawetan = pengawetan.map(item => ({
    id: item.id,
    name: item.nama,
  }));

  const { mutate: update, isLoading: isUpdating } = useMutation(
    data => axios.post(`/master/parameter/${uuid}/update`, data),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Data updated successfully",
        });
        navigation.navigate("Parameter");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to update data",
        });
        console.error(error.response?.data || error);
      },
    },
  );

  const { mutate: create, isLoading: isCreating } = useMutation(
    data => axios.post(`/master/parameter/store`, data),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Data created successfully",
        });
        navigation.navigate("Parameter");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to create data",
        });
        console.error(error.response?.data || error);
      },
    },
  );

  const onSubmit = data => {
    if (uuid) {
      update(data);
    } else {
      create(data);
    }
  };

  if (isLoadingData && uuid) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView className="bg-[#ececec] h-full">
      <View className="bg-white rounded m-3">
        <View className="flex-row justify-between mx-3 mt-4">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-xl font-bold">
            {data ? "Edit Peraturan" : "Tambah Peraturan"}
          </Text>
        </View>
        <View className="p-5 flex-col space-y-2">
          <Text className="text-md mb-2 font-poppins-medium">Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "nama is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Masukkan Nama Peraturan"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onBlur={onBlur}
                error={errors?.nama?.message}
              />
            )}
          />
          {errors.nama && (
            <Text className="text-red-500">{errors.nama.message}</Text>
          )}
          <Text className="text-md font-poppins-medium mb-2">Keterangan</Text>
          <Controller
            control={control}
            name="keterangan"
            rules={{ required: "Keterangan is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Masukkan Keterangan"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onBlur={onBlur}
                error={errors?.keterangan?.message}
              />
            )}
          />
          {errors.keterangan && (
            <Text className="text-red-500">{errors.keterangan.message}</Text>
          )}
          <Text className="text-md font-poppins-medium mt-2">
            Jenis Parameter
          </Text>
          <Controller
            control={control}
            name="jenis_parameter"
            rules={{ required: "Jenis Parameter is required" }}
            render={({ field: { onChange, value } }) => (
              <Select2
                onChangeValue={value => {
                  onChange(value);
                  setSelectedJenisParameter(value);
                }}
                value={value}
                items={formattedJenisParameter}
                placeholder={{ label: "Pilih jenis parameter", value: null }}
              />
            )}
          />
          {errors.jenis_parameter && (
            <Text className="text-red-500">
              {errors.jenis_parameter.message}
            </Text>
          )}
          <Text className="text-md font-poppins-medium mb-2">Metode</Text>
          <Controller
            control={control}
            name="metode"
            rules={{ required: "Metode is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Masukkan Metode"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onBlur={onBlur}
                error={errors?.metode?.message}
              />
            )}
          />
          {errors.metode && (
            <Text className="text-red-500">{errors.metode.message}</Text>
          )}
          <Text className="text-md font-poppins-medium mb-2">Harga</Text>
          <Controller
            control={control}
            name="harga"
            rules={{ required: "Harga is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                placeholder="Masukkan Harga"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onBlur={onBlur}
                error={errors?.harga?.message}
              />
            )}
          />
          {errors.harga && (
            <Text className="text-red-500">{errors.harga.message}</Text>
          )}

          <Text className="text-md font-poppins-medium mb-2">Pengawetan</Text>
          <Controller
            control={control}
            name="pengawetan"
            rules={{ required: "Pengawetan is required" }}
            render={({ field: { onChange, value } }) => (
              <MultiSelect
                hideTags
                items={formattedPengawetan}
                uniqueKey="id"
                onSelectedItemsChange={items => {
                  onChange(items);
                  setSelectedPengawetan(items);
                }}
                selectedItems={selectedPengawetan}
                selectText="Pilih pengawetan"
                searchInputPlaceholderText="Cari pengawetan..."
                onChangeInput={text => console.log(text)}
                altFontFamily="ProximaNova-Light"
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: "#CCC" }}
                submitButtonColor="#CCC"
                submitButtonText="Submit"
              />
            )}
          />
          {errors.pengawetan_ids && (
            <Text className="text-red-500">{errors.pengawetan_ids.message}</Text>
          )}
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
});
