import {View, Text, Button, TextField } from "react-native-ui-lib";
import React, { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator } from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";


export default memo(function Form({ route, navigation}){
    const { name } = route.params || {}
    const { handleSubmit, control, formState: { errors }, setValue } = useForm()

    const { data, isLoading: isLoadingData } = useQuery(['jabatan', name], () =>
        name ? axios.get(`/master/jabatan/${name}/edit`).then(res => res.data.data) : null,
     {
        enabled: !!name,
        onSuccess: (data) => {
            if (data) {
                setValue('full_name', data.full_name)
            }
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load data'
            })
            console.error(error)
        }
     })

     const queryClient = useQueryClient()

     const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(name ? `/master/jabatan/${name}/update` : '/master/jabatan/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: name ? 'Success update data' : 'Success create data'
                });
                queryClient.invalidateQueries(['/master/jabatan']);
                navigation.navigate("Jabatan")
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: name ? 'Failed update data' : 'Failed create data'
                })
                console.error(error)
            }
        }
     )

     const onSubmit = (data) => {
        createOrUpdate(data)
     }

     if(isLoadingData && name){
       return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"}/></View>
     }

    return (
       <ScrollView className="bg-[#ececec] h-full">
         <View className="bg-white rounded m-3">
            <View className="flex-row justify-between mx-3 mt-4">
                <BackButton action={() => navigation.goBack()} size={26}/>
                    <Text className="text-xl font-bold">{ data ? "Edit Jabatan" : "Tambah Metode" }</Text>
            </View>
            <View className="p-5">
                <Text className="mb-3 text-lg font-semibold">Nama</Text>
                <Controller
                  control={control}
                  name="full_name"
                  rules={{ required: 'Nama is required' }}
                  render={({ field: { onChange, value } }) => (
                    <TextField
                      placeholder="Masukkan Nama Jabatan"
                      enableErrors
                      className="py-3 px-5 rounded border-[1px] border-gray-700"
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.nama && (
                    <Text className="text-red-500">
                        {errors.full_name.message}
                    </Text>
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
})

