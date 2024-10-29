import { View, Text, Button, TextField } from 'react-native-ui-lib'
import React, { memo } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import axios from '@/src/libs/axios'
import Toast from 'react-native-toast-message'
import BackButton from '@/src/screens/components/BackButton'

export default memo(function form({ route, navigation }) {
    const { uuid } = route.params || {}
    const { handleSubmit, control, formState: {errors}, setValue } = useForm();

    const { data, isLoading: isLoadingData } = useQuery(["kode-retribusi", uuid], () => 
        uuid ? axios.get(`/master/kode-retribusi/${uuid}/edit`).then(res => res.data.data) : null,
    {
        enabled: !!uuid,
        onSuccess: (data) => {
            if (data) {
                setValue("kode", data.kode),
                setValue("nama", data.nama);
            }
        },
        onError: (error) => {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to Load Data",
            });
            console.error(error);
        }
    });

    const queryClient = useQueryClient();
    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(uuid ? `/master/kode-retribusi/${uuid}/update` : '/master/kode-retribusi/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: uuid ? "Success update data" : "Success create data",
                });
                queryClient.invalidateQueries(["/master/kode-retribusi"])
                navigation.navigate("KodeRetribusi")
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to update data",
                });
                console.error(error);
            }
        }
    )

    const onSubmit = (data) => {
        createOrUpdate(data)
    };

    if ( isLoadingData && uuid) {
        return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
    }

    return (
        <ScrollView className="bg-[#ececec] h-full">
            <View className="bg-white rounded m-3">
                <View className="flex-row justify-between mx-3 mt-4">
                    <BackButton action={() => navigation.goBack()} size={26} />
                        <Text className="text-xl font-poppins-semibold">
                            {data ? "Edit Kode Retribusi" : "Tambah Kode Retribusi"}
                        </Text>
                </View>
                <View className="p-5 flex-col space-y-4">
                    <Text className="text-lg mb-2 font-semibold">Kode</Text>
                    <Controller
                        control={control}
                        name="kode"
                        rules={{ required: "Kode harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                placeholder="Masukkan Kode"
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                enabledErrors
                                />
                        )}
                    />
                    {errors.kode && (
                        <Text className="text-red-500">{errors.kode.message}</Text>
                    )}
                     <Text className="text-lg mb-2 font-semibold">nama</Text>
                    <Controller
                        control={control}
                        name="nama"
                        rules={{ required: "nama harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                placeholder="Masukkan nama"
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                enabledErrors
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
                        className="rounded-md bg-indigo-800"
                        disabled={isLoading}
                    />
                </View>
            </View>
        </ScrollView>
    )
})

