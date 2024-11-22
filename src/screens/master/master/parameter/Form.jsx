import React, { useState, memo, useEffect } from "react";
import { View, Text, Button, TextField } from "react-native-ui-lib";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator, FlatList } from "react-native";
import { Controller, useForm } from "react-hook-form";
import Select2 from "@/src/screens/components/Select2";
import axios from "@/src/libs/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import MultiSelect from "react-native-multiple-select";
import { Switch } from "react-native-paper";

export default memo(function Form({ route, navigation }) {
  const [jenisParameter, setJenisParameter] = useState([]);
  const [pengawetan, setPengawetan] = useState([]);
  const [selectedJenisParameter, setSelectedJenisParameter] = useState([]);
  const [selectedPengawetan, setSelectedPengawetan] = useState([]);
  const queryClient = useQueryClient()
  const { uuid } = route.params || {};
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      is_akreditasi: false,
      is_dapat_diuji: false,
      pengawetan_ids: []
    }
  });

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
          setValue("jenis_parameter_id", data.jenis_parameter_id);
          setValue("metode", data.metode);
          setValue(
            "harga",
            data.harga.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."),
          );
          setValue("pengawetan", data.pengawetan_ids || []);
          setSelectedPengawetan(data.pengawetan_ids || []);
          setValue("satuan", data.satuan);
          setValue("mdl", data.mdl);
          setValue("is_akreditasi", Boolean(data.is_akreditasi));
          setValue("is_dapat_diuji", Boolean(data.is_dapat_diuji));
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

  const { mutate: createOrUpdate, isLoading } = useMutation(
    (data) => axios.post(uuid ? `/master/parameter/${uuid}/update` : '/master/parameter/store', data),
    {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: uuid ? 'Success update data' : 'Success create data'
        })
        queryClient.invalidateQueries(["/master/parameter"])
        navigation.navigate("Parameter")
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Success',
          text2: uuid ? 'Failed update data' : 'Failed create data'
        })
        console.error(error)
      }
    }
  )

  const onSubmit = data => {
    const formattedData = {
      ...data,
      is_akreditasi: data.is_akreditasi ? 1 : 0,
      is_dapat_diuji: data.is_dapat_diuji ? 1 : 0,
      pengawetan_ids: data.pengawetan || []
    }
    createOrUpdate(formattedData)
  };

  if (isLoadingData && uuid) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <FlatList
      className="bg-[#ececec] h-full"
      data={[{ key: "form" }]}
      renderItem={() => (
        <View className="bg-white rounded m-3">
          <View className="flex-row justify-between mx-3 mt-4">
            <BackButton action={() => navigation.goBack()} size={26} />
            <Text className="text-xl font-poppins-semibold">
              {data ? "Edit Parameter" : "Tambah Parameter"}
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
                  style={{ fontFamily: "Poppins-Regular" }}
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
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  style={{ fontFamily: "Poppins-Regular" }}
                  placeholder="Masukkan Keterangan"
                  value={value}
                  onChangeText={onChange}
                  className="py-3 px-5 rounded border-[1px] border-gray-700"
                  onBlur={onBlur}
                />
              )}
            />
        
            <Text className="text-md font-poppins-medium mt-2">
              Jenis Parameter
            </Text>
            <Controller
              control={control}
              name="jenis_parameter_id"
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
            {errors.jenis_parameter_id && (
              <Text className="text-red-500">
                {errors.jenis_parameter_id.message}
              </Text>
            )}
            <Text className="text-md font-poppins-medium mb-2">Metode</Text>
            <Controller
              control={control}
              name="metode"
              rules={{ required: "Metode is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  style={{ fontFamily: "Poppins-Regular" }}
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
                  style={{ fontFamily: "Poppins-Regular" }}
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

            <Text className="text-md font-poppins-medium mb-2">Satuan</Text>
            <Controller
              control={control}
              name="satuan"
              rules={{ required: "Satuan is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  style={{ fontFamily: "Poppins-Regular" }}
                  placeholder="Masukkan Satuan"
                  value={value}
                  onChangeText={onChange}
                  className="py-3 px-5 rounded border-[1px] border-gray-700"
                  onBlur={onBlur}
                  error={errors?.satuan?.message}
                />
              )}
            />
            {errors.satuan && (
              <Text className="text-red-500">{errors.satuan.message}</Text>
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
                  fontFamily="Poppins-Regular"
                  selectedItems={value || []}
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
              <Text className="text-red-500">
                {errors.pengawetan_ids.message}
              </Text>
            )}
            <View className="flex-col items-start mb-3">
              <Text className="text-md font-poppins-semibold mb-2">
                Terakditasi
              </Text>
              <Controller
                control={control}
                name="is_akreditasi"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={Boolean(value)}
                    onValueChange={value => {
                      onChange(value);
                    }}
                  />
                )}
              />
              {errors.is_akreditasi && (
                <Text className="text-red-500">
                  {errors.is_akreditasi.message}
                </Text>
              )}
            </View>
            <View className="flex-col items-start mb-2">
              <Text className="text-md font-poppins-semibold mb-2">
                Dapat Diuji di Lab
              </Text>
              <Controller
                control={control}
                name="is_dapat_diuji"
                render={({ field: { onChange, value } }) => (
                  <Switch
                    value={Boolean(value)}
                    onValueChange={value => {
                      onChange(value);
                    }}
                  />
                )}
              />
              {errors.is_dapat_diuji && (
                <Text className="text-red-500">
                  {errors.is_dapat_diuji.message}
                </Text>
              )}
            </View>
            <Button
              labelStyle={{ fontFamily: "Poppins-Medium" }}
              label="Simpan"
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
              className="rounded-md bg-indigo-800"
              disabled={isLoading}
            />
          </View>
        </View>
      )}
      keyExtractor={item => item.key}
    />
  );
});
