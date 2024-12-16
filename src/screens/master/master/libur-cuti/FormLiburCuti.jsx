import React, { memo, useState } from "react";
import { View, Text, Button, TextField } from "react-native-ui-lib";
import { ScrollView } from "react-native-gesture-handler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, Platform, Pressable } from "react-native";
import { Controller, useForm } from "react-hook-form";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";

export default memo(function form({ route, navigation }) {
    const { uuid } = route.params || {};
    const { handleSubmit, control, formState: {errors}, setValue } = useForm();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const { data, isLoading: isLoadingData } = useQuery(["libur-cuti", uuid], () => 
        uuid ? axios.get(`/master/libur-cuti/${uuid}/edit`).then(res => res.data.data) : null,
        {
            enabled: !!uuid,
            onSuccess: (data) => {
                if (data) {
                    // Konversi string tanggal ke objek Date jika diperlukan
                    setValue("tanggal", data.tanggal ? new Date(data.tanggal) : new Date()),
                    setValue("keterangan", data.keterangan);
                }
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to update data",
                })
                console.error(error);
            }
        });

    const queryClient = useQueryClient();
    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => {
            // Format tanggal sebelum dikirim ke server
            const formattedData = {
                ...data,
                tanggal: formatDate(data.tanggal)
            };
            return axios.post(
                uuid ? `/master/libur-cuti/${uuid}/update` : '/master/libur-cuti/store', 
                formattedData
            );
        },
        {
            onSuccess: () => {
                Toast.show({
                    type: "success",
                    text1: "Success",
                    text2: uuid ? "Sukses update data" : "Sukses menambahkan datadata",
                });
                queryClient.invalidateQueries(["/master/libur-cuti"])
                navigation.navigate("LiburCuti")
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to update data",
                });
                console.error(error);
            },
        },
    );

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const onSubmit = (data) => {
        createOrUpdate(data);
    };

    if (isLoadingData && uuid) {
        return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
    }

    return (
        <View className="bg-[#ececec] h-full">
            <View className="bg-white rounded m-3">
                <View className="flex-row justify-between mx-3 mt-4">
                    <BackButton action={() => navigation.goBack()} size={26} />
                    <Text className="text-xl font-poppins-semibold">
                        {data ? "Edit Libur Cuti" : "Tambah Libur Cuti"}
                    </Text>
                </View>
                <View className="p-5 flex-col space-y-4">
                    <Text className="text-lg mb-2 font-poppins-semibold">Tanggal</Text>
                    <Controller
                        control={control}
                        name="tanggal"
                        rules={{ required: "tanggal harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <>
                                <Pressable
                                    onPress={() => setShowDatePicker(true)}
                                    className="py-3 px-5 rounded border-[1px] border-gray-700"
                                >
                                    <Text className="font-poppins-regular">{value ? formatDate(value) : "Pilih Tanggal"}</Text>
                                </Pressable>
                                {showDatePicker && (
                                    <DateTimePicker
                                        
                                        value={value || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(Platform.OS === 'ios');
                                            if (selectedDate) {
                                                onChange(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                            </>
                        )}
                    />
                    {errors.tanggal && (
                        <Text className="text-red-500">{errors.tanggal.message}</Text>
                    )}
                    <Text className="text-lg mb-2 font-poppins-semibold">Keterangan</Text>
                    <Controller
                        control={control}
                        name="keterangan"
                        rules={{ required: "Keterangan harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan Keterangan"
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                enableErrors
                            />
                        )}
                    />
                    {errors.keterangan && (
                        <Text className="text-red-500">{errors.keterangan.message}</Text>
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