import { View, Text, Button, TextField } from 'react-native-ui-lib'
import React, { memo } from 'react'
import { ScrollView } from 'react-native-gesture-handler'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ActivityIndicator } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import axios from '@/src/libs/axios'
import Toast from 'react-native-toast-message'
import BackButton from '@/src/screens/components/BackButton'
import IonIcon from 'react-native-vector-icons/Ionicons'

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
                    text2: uuid ? "Sukses update data" : "Sukses menambahkan datadata",
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
        <View className="bg-[#ececec] h-full">
             <View
                       className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
                       style={{ backgroundColor: '#fff' }}
                     >
                         <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
                         <Text className="text-lg font-poppins-semibold">
                            {data ? "Edit Kode Retribusi" : "Tambah Kode Retribusi"}
                        </Text>                       
                     </View>
            <View className="bg-white rounded m-3">
                <View className="p-5 flex-col space-y-4">
                    <Text className="text-lg mb-2 font-poppins-semibold">Kode</Text>
                    <Controller
                        control={control}
                        name="kode"
                        rules={{ required: "Kode harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                placeholder="Masukkan Kode"
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700 font-poppins-regular"
                                enabledErrors
                                />
                        )}
                    />
                    {errors.kode && (
                        <Text className="text-red-500">{errors.kode.message}</Text>
                    )}
                     <Text className="text-lg mb-2 font-poppins-semibold">Nama</Text>
                    <Controller
                        control={control}
                        name="nama"
                        rules={{ required: "nama harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan nama"
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700 "
                                enabledErrors
                                />
                        )}
                    />
                    {errors.nama && (
                        <Text className="text-red-500">{errors.nama.message}</Text>
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

