import { View, Text, Button, TextField } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import React, { memo } from "react";
import { ActivityIndicator } from "react-native";
import axios from "@/src/libs/axios"; 
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";

export default memo(function form({ route, navigation }) {
    const { uuid } = route.params || {};
    const { handleSubmit, control, formState: { errors }, setValue } = useForm();

    const { data, isLoading: isLoadingData } = useQuery(
        ["paket", uuid],
        () => 
          uuid
            ? axios.get(`/master/paket/${uuid}/edit`).then(res => res.data.data)
            : null,
        {
            enabled: !!uuid,
            onSuccess: data => {
                console.log(data); 
                if (data) {
                    setValue("nama", data.nama),
                    setValue("harga", new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(data.harga));
                }
            },
            onError: error => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to laod data",
                });
                console.error(error);
            },
        },
    );

    const { mutate: update, isLoading: isUpdating } = useMutation(
        data => axios.post(`/master/paket/${uuid}/update`, data),
        {
            onSuccess: () => {
                Toast.show({
                    type: "success",
                    text1: "success",
                    text2: "Data updated successfully",
                });
                navigation.navigate("Paket");
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

    const { mutate: create, isLoading: isCreating} = useMutation(
        data => axios.post(`/master/paket/store`, data),
        {
            onSuccess: () => {
                Toast.show({
                    type: "success",
                    text1: "success",
                    text2: "Data created successfully",
                });
               navigation.navigate("Paket");
            },
            onError: error => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to create data",
                });
                console.error(error.response?.data || error);
            }
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
        <ScrollView className="bg-[#ececec] h-full">
            <View className="bg-white rounded m-3">
                <View className="flex-row justify-between mx-3 mt-4">
                    <BackButton action={() => navigation.goBack()} size={26} />
                    <Text className="text-xl font-bold">
                        {data ? "Edit Paket" : "Tambah Paket"}
                    </Text>
                </View>
                <View className="p-5 flex-col space-y-4">
                    <Text className="text-lg mb-2 font-semibold">Nama</Text>
                    <Controller
                        control={control}
                        name="nama"
                        rules={{ required: "nama is required" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                placeholder="Masukkan Nama Paket"
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
                    <Text className="text-lg mb-2 font-semibold">Harga</Text>
                    <Controller
                        control={control}
                        name="harga"
                        defaultValue=""
                        rules={{ required: "Harga is required" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                placeholder="Masukkan Harga Paket"
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
                    <Button
                        label="Simpan"
                        loading={isUpdating}
                        onPress={handleSubmit(onSubmit)}
                        className="rounded-md bg-indigo-800"
                        disabled={isCreating || isUpdating}
                    />
                </View>
            </View>
        </ScrollView>
    );
});