import { View, Text, Button, TextField } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
            onSuccess: (data) => {
                if (data) {
                    setValue("nama", data.nama),
                    setValue("harga", new Intl.NumberFormat('id-ID', { style: 'decimal' }).format(data.harga));
                }
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to laod data",
                });
                console.error(error);
            },
        },
    );

    const queryClient = useQueryClient()

    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(uuid ? `/master/paket/${uuid}/update` : '/master/paket/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: "success",
                    text1: "success",
                    text2: uuid ? "Data updated successfully" : "Data created successfully"
                });
                queryClient.invalidateQueries(["/master/paket"]);
                navigation.navigate("Paket");
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Failed to update data",
                });
                console.error(error.response?.data || error);
            },
        },
    );

    const formatRupiah = (value) => {
        const cleanValue = value.replace(/[^0-9]/g, "");
        return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    const onSubmit = data => {
       createOrUpdate(data)
    };

    if (isLoadingData && uuid) {
        return (
            <View className="h-full flex justify-center">
                <ActivityIndicator size={"large"} color={"#312e81"} />
            </View>
        );
    }

    return (
        <View className="bg-[#ececec] h-full">
            <View className="bg-white rounded m-3">
                <View className="flex-row justify-between mx-3 mt-4">
                    <BackButton action={() => navigation.goBack()} size={26} />
                    <Text className="text-xl font-poppins-semibold">
                        {data ? "Edit Paket" : "Tambah Paket"}
                    </Text>
                </View>
                <View className="p-5 flex-col space-y-4">
                    <Text className="text-lg mb-2 font-poppins-semibold">Nama</Text>
                    <Controller
                        control={control}
                        name="nama"
                        rules={{ required: "nama is required" }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan Nama Paket"
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                error={errors?.nama?.message}
                                />
                        )}
                    />
                    {errors.nama && (
                        <Text className="text-red-500">{errors.nama.message}</Text>
                    )}
                    <Text className="text-lg mb-2 font-poppins-regular">Harga</Text>
                    <Controller
                        control={control}
                        name="harga"
                        defaultValue=""
                        rules={{ 
                            required: "Harga is required", 
                            pattern:{
                                value: /^[0-9.]*$/,
                                message: "Harga harus berupa number",
                            },  
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                placeholder="Masukkan Harga Paket"
                                value={value}
                                onChangeText={(text) => {
                                    const formattedValue = formatRupiah(text);
                                    onChange(formattedValue);
                                }}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                error={errors?.harga?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    {errors.harga && (
                        <Text className="text-red-500">{errors.harga.message}</Text>
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
    );
});