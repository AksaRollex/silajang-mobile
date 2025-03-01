import React, { memo, useState } from "react";
import { View, Text, Button, TextField } from "react-native-ui-lib";
import { ScrollView } from "react-native-gesture-handler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator } from "react-native";
import { Controller, useForm } from "react-hook-form";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import { Picker } from "@react-native-picker/picker";
import IonIcon from "react-native-vector-icons/Ionicons";
import Select2 from "../../components/Select2";

export default memo(function TandaTanganForm({ route, navigation }) {
    const { uuid } = route.params || {};
    const [formData, setFormData] = useState({
        bagian: '',
        user_id: '',
        nama: ''
    });
    const [nama, setNama] = useState([]);

    const { handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues: formData
    });


    const { data: dinasInternalData, isLoading: isLoadingDinas } = useQuery(
        ['dinas-internal'],
        () => axios.get("/master/user?golongan_id=2").then(res => res.data.data),
        {
            onSuccess: data => setNama(data),
        }
    );

    const formattedNama = nama?.map(item => ({
        value: item.id,
        title: item.nama,
    }));


    const { isLoading: isLoadingData } = useQuery(
        ["tanda-tangan", uuid],
        () => uuid ? axios.get(`/konfigurasi/tanda-tangan/${uuid}/edit`).then(res => res.data.data) : null,
        {
            enabled: !!uuid,
            onSuccess: (data) => {
                if (data) {
                   
                    setFormData(data);
                    
                    reset(data);
                }
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Gagal mengambil data",
                });
                console.error(error);
            }
        }
    );

    const queryClient = useQueryClient();
    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(`/konfigurasi/tanda-tangan/${uuid}/update`, data),
        {
            onSuccess: () => {
                Toast.show({
                    type: "success",
                    text1: "Sukses",
                    text2: "Data berhasil disimpan",
                });
                queryClient.invalidateQueries(["/konfigurasi/tanda-tanganQ"]);
                navigation.goBack();
            },
            onError: (error) => {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: error.response?.data?.message || "Gagal menyimpan data",
                });
                console.error(error);
            },
        }
    );

    const onSubmit = (data) => {
        createOrUpdate(formData); 
    };

    return (
        <View className="bg-[#ececec] h-full">
              <View
                    className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
                    style={{ backgroundColor: "#fff" }}>
                    <IonIcon
                      name="arrow-back-outline"
                      onPress={() => navigation.goBack()}
                      size={25}
                      color="#312e81"
                    />
                    <Text className="text-lg font-poppins-semibold">
                        Edit Tanda Tangan
                    </Text>
                  </View>
            <View className="bg-white rounded m-3">
                <View className="p-5 flex-col space-y-4">
                    <View className="mb-4">
                        <Text className="text-lg font-poppins-medium text-black mb-2">Dokumen</Text>
                        <Controller
                            control={control}
                            name="bagian"
                            rules={{ required: "Bagian Dokumen harus diisi" }}
                            render={({ field: { onChange } }) => (
                                <TextField
                                
                                    value={formData.bagian}
                                    onChangeText={(text) => {
                                        setFormData(prev => ({ ...prev, bagian: text }));
                                        onChange(text);
                                    }}
                                    className="py-3 px-5 rounded bg-gray-100 border-[1px] border-gray-300"
                                    editable={false}
                                    style={{ color: '#666', fontFamily: 'Poppins-Regular' }}
                                />
                            )}
                        />

                        {errors.bagian && (
                            <Text className="text-red-500 mt-1 text-sm">{errors.bagian.message}</Text>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="text-lg font-poppins-semibold text-black mb-2">Nama</Text>
                        <Controller
                            control={control}
                            name="user_id"
                            rules={{ required: "Penanda Tangan harus diisi" }}
                            render={({ field: { onChange, value } }) => (
                                <View className="border-[1px] border-gray-300 rounded">
                                    <Select2
                                        onSelect={value => {
                                            onChange(value);
                                        }}
                                        defaultValue={value}
                                        data={formattedNama}
                                        placeholder="Pilih Penanda Tangan"
                                    >

                                    </Select2>
                                </View>
                            )}
                        />
                        {errors.user_id && (
                            <Text className="text-red-500 mt-1 text-sm">{errors.user_id.message}</Text>
                        )}
                    </View>

                    <Button
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
