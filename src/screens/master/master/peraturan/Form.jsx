import { View, Text, Button, TextField, TouchableOpacity } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import React, { memo, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import Pdf from "react-native-pdf";
import DocumentPicker from 'react-native-document-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Feather'

export default memo(function Form({ route, navigation }) {
  const { uuid } = route.params || {};
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();

  const { data, isLoading: isLoadingData } = useQuery(
    ["peraturan", uuid],
    () =>
      uuid
        ? axios.get(`/master/peraturan/${uuid}/edit`).then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("nama", data.nama),
            setValue("nomor", data.nomor),
            setValue("tentang", data.tentang);
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

  const { mutate: createOrUpdate, isLoading } = useMutation(
    async data =>{ 
      const formData = new FormData();
      formData.append('nama', data.nama);
      formData.append('nomor', data.nomor);
      formData.append('tentang', data.tentang);

      if(selectedFile){
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.type,
          name: selectedFile.name,
        });
      }
      
      axios.post(uuid ? `/master/peraturan/${uuid}/update` : '/master/peraturan/store', formData, { 
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }})
    },
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid ? "Data updated successfully" : 'Data created successfully',
        });
        queryClient.invalidateQueries(["/master/peraturan"]);
        navigation.navigate("Peraturan");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: uuid ? "Failed to update data" : "Failed to create data",
        });
        console.error(error.response?.data || error);
      },
    },
  );

  
  const handleFilePicker = async () => {
    try{
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setSelectedFile(res[0]);
    } catch (err) {
      if(DocumentPicker.isCancel(err)) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "No file selected",
        })
    } else {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  } 
}
  
  const onSubmit = data => {
    createOrUpdate(data)
  }

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
          <Text className="font-poppins-medium text-xl">
            {data ? "Edit Peraturan" : "Tambah Peraturan"}
          </Text>
        </View>
        <View className="p-5 flex-col space-y-4">
          <Text className="font-poppins-medium text-lg mb-2">Nama</Text>
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
            <Text className="font-poppins-medium text-red-500">{errors.nama.message}</Text>
          )}
          <Text className="font-poppins-medium text-lg mb-2 ">Tentang</Text>
          <Controller
            control={control}
            name="tentang"
            rules={{ required: "Tentang is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
              style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Tentang Peraturan"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onBlur={onBlur}
                error={errors?.tentang?.message}
              />
            )}
          />
          {errors.tentang && (
            <Text className="font-poppins-medium text-red-500">{errors.tentang.message}</Text>
          )}
          <Text className="font-poppins-medium text-lg mb-2 ">Nomor</Text>
          <Controller
            control={control}
            name="nomor"
            rules={{ required: "nomor is required" }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
              style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Masukkan Nomor Peraturan"
                value={value}
                onChangeText={onChange}
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onBlur={onBlur}
                error={errors?.nomor?.message}
              />
            )}
          />
          {errors.nomor && (
            <Text className="font-poppins-medium text-red-500">{errors.nomor.message}</Text>
          )}

          <Text className="text-lg font-poppins-medium">Upload File</Text>
          {selectedFile && (
            <Text className="text-md font-poppins-medium text-gray-700">
              File terpilih: {selectedFile.name}
            </Text>
          )}
          <TouchableOpacity onPress={handleFilePicker} className="rounded-md flex-row justify-center p-3 space-x-3 items-center bg-red-700">
            <Text className="text-white text-base font-poppins-medium">Upload PDF</Text>
            <Icon name="upload" size={20} color="white" />
          </TouchableOpacity>

          <Button
            label="Simpan"
            labelStyle={{ fontFamily: "Poppins-Medium" }} 
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            className="rounded-md bg-indigo-800"
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );  
})
