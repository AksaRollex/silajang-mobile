import React, { memo } from "react"
import { View, Text, Button, TextField } from "react-native-ui-lib"
import { useForm, controller, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ActivityIndicator } from "react-native-paper"
import axios from "@/src/libs/axios"
import Toast from "react-native-toast-message"
import BackButton from "@/src/screens/components/BackButton"

export default memo(function FormJenisWadah({ route, navigation}) {
    const  { uuid } = route.params || {}
    const { handleSubmit, control, formState: {errors}, setValue } = useForm();

    const { data, isLoading: isLoadingData } = useQuery(["jenis-wadah", uuid], () => 
        uuid ? axios.get(`/master/jenis-wadah/${uuid}/edit`).then(res => res.data.data) : null,
    {
        enabled: !!uuid,
        onSuccess: (data) => {
            if (data) {
                setValue("nama", data.nama);
                setValue("keterangan", data.keterangan);
            }
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to load data",
            })
            console.error(error)
        }
    });

    const queryClient = useQueryClient()

    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(uuid ? `/master/jenis-wadah/${uuid}/update` : '/master/jenis-wadah/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: uuid ? 'Success update data' : 'Success create data'
                })
                queryClient.invalidateQueries(["/master/jenis-wadah"])
                navigation.navigate("JenisWadah")
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: uuid ? 'Failed update data' : 'Failed create data'
                })
                console.error(error)
            }
        }
    )

    const onSubmit = (data) => {
        createOrUpdate(data)
    }

    if(isLoadingData && uuid){
        return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color='#312e81' /></View>
    }

    return (
        <View className="bg-[#ececec] h-full">
            <View className="bg-white rounded m-3">
                <View className="flex-row justify-between mx-3 mt-4">
                    <BackButton action={() => navigation.goBack()} size={26}/>
                    <Text className="text-base font-poppins-semibold">{ data ? 'Edit Jenis Wadah' : 'Tambah Jenis Wadah'}</Text>
                </View>
                <View className="p-5">
                    <Text className="mb-3 text-lg font-poppins-semibold">Nama</Text>
                    <Controller
                        control={control}
                        name="nama"
                        rules={{  required: 'Nama is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan Nama Jenis Wadah"
                                enableErrors
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        />
                    {errors.nama && (
                        <Text className="text-red-500">
                            {errors.nama.message}
                        </Text>
                    )}
                    <Text className="mb-3 text-lg font-poppins-semibold">Keterangan</Text>
                    <Controller
                        control={control}
                        name="keterangan"
                        rules={{  required: 'Keterangan is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan keterangan Wadah"
                                enableErrors
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                        />
                        {errors.keterangan && (
                            <Text className="text-red-500">
                                {errors.keterangan.message}
                            </Text>
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
    )
})