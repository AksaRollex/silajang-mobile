import React, { memo } from 'react'
import { View, Text, Button, TextField } from 'react-native-ui-lib'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator } from 'react-native-paper'
import axios from '@/src/libs/axios'
import Toast from 'react-native-toast-message'
import BackButton from '@/src/screens/components/BackButton'

export default memo(function FormJasaPengambilan({ route, navigation }) {
    const { uuid } = route.params || {}
    const { handleSubmit, control, formState: {errors}, setValue } = useForm(); 

    const { data, isLoading: isLoadingData } = useQuery(["jasa-pengambilan", uuid], () =>
        uuid ? axios.get(`/master/jasa-pengambilan/${uuid}/edit`).then(res => res.data.data) : null,
    {
        enabled: !!uuid,
        onSuccess: (data) => {
            if (data) {
                setValue("wilayah", data.wilayah);
                setValue("harga", new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(data.harga));
            }
        },
        onError: error => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to laod data",
            })
            console.error(error)
    }
    });

    const queryClient = useQueryClient()

    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(uuid ? `/master/jasa-pengambilan/${uuid}/update` : '/master/jasa-pengambilan/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: uuid ? 'Success update data' : 'Success create data'
                })
                queryClient.invalidateQueries(["/master/jasa-pengambilan"])
                navigation.navigate("JasaPengambilan")
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: uuid ?  'Failed update data' : 'Failed create data'
                })
                console.error(error)
            }
        }
    )

    const formattedRupiah = (value) => {
        const cleanValue = value.replace(/[^0-9]/g, "");
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const onSubmit = (data) => {
        createOrUpdate(data)
    }

    if(isLoadingData && uuid) {
        return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color="#312e81"/></View>
    }

    return (
        <View className="bg-[#ececec] h-full">
            <View className="bg-white rounded m-3">
                <View className="flex-row justify-between mx-3 mt-4">
                    <BackButton action={() => navigation.goBack()} size={26}/>
                        <Text className="text-base font-poppins-semibold">{ data ? 'Edit Jasa Pengambilan' : 'Tambah Jasa Pengambilan'}</Text>
                </View>
                <View className="p-5">
                    <Text className="mb-3 text-lg font-poppins-semibold">Wilayah</Text>
                    <Controller
                        control={control}
                        name="wilayah"
                        rules={{ required: 'Wilayah is required' }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan Wilayah"
                                enableErrors
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />
                    {errors.wilayah && (
                        <Text className="text-red-500">
                            {errors.wilayah.message}
                        </Text>
                    )}
                    <Text className="mb-3 text-lg font-poppins-semibold">Harga</Text>
                    <Controller
                        control={control}
                        name="harga"
                        rules={{ 
                            required: 'Harga is required',
                            pattern: {
                                value: /^[0-9.]*$/,
                                message: "Harga harus berupa angka"
                            }
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan Harga"
                                enableErrors
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                onChangeText={(text) => {
                                    const formattedValue = formattedRupiah(text);
                                    onChange(formattedValue);
                                }}
                                value={value}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.harga && (
                        <Text className="text-red-500">
                            {errors.harga.message}
                        </Text>
                    )}
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
        </View>
    )

})