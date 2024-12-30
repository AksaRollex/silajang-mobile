import { StyleSheet } from 'react-native'
import { View, Text, Button, TextField, Checkbox } from "react-native-ui-lib";
import React, { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import IonIcon from 'react-native-vector-icons/Ionicons';
import { TextFooter } from '../../components/TextFooter';
import axios from '@/src/libs/axios';
import Toast from 'react-native-toast-message';
import { useHeaderStore } from '@/src/screens/main/Index';

const Denda = ({ navigation }) => {
    const { setHeader } = useHeaderStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [data, setData] = useState(null);

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        reset
    } = useForm({
        defaultValues: {
            nominal: '',
            tipe: '%',
            tempo: ''
        }
    });

    useEffect(() => {
        fetchDendaData();
    }, []);
    
    const fetchDendaData = async () => {
        setIsLoadingData(true);
        try {
            const response = await axios.get("/konfigurasi/denda");
            console.log('Denda data:', response.data);
            if (response.data) {
                reset({
                    nominal: response.data.data.nominal?.toString() || '', 
                    tipe: response.data.data.tipe || '%', 
                    tempo: response.data.data.tempo?.toString() || '' 
                });
            }
        } catch (error) {
            console.error('Error fetching denda data:', error);
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: 'Gagal mengambil data denda',
            });
        } finally {
            setIsLoadingData(false);
        }
    };
    

    React.useLayoutEffect(() => {
        setHeader(false)
        return () => setHeader(true)
    }, []);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await axios.post("/konfigurasi/denda", {
                nominal: Number(data.nominal),
                tipe: data.tipe,
                tempo: Number(data.tempo)
            });
            
            Toast.show({
                type: 'success',
                text1: 'Berhasil',
                text2: 'Denda berhasil diperbarui',
            });
            navigation.goBack();

        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Gagal',
                text2: error.response?.data?.message || 'Gagal memperbarui denda',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoadingData) {
        return (
            <View className="flex-1 justify-center items-center bg-[#ececec]">
                <Text className="font-poppins-regular">Memuat data...</Text>
            </View>
        );
    }

    return (
        <View className="bg-[#ececec] w-full h-full">
            <View
                className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
                style={{ backgroundColor: '#fff' }}
            >
                <View className="flex-row items-center">
                    <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
                    <Text className="text-[20px] font-poppins-medium text-black ml-3">Pengaturan Denda</Text>
                </View>
                <View className="bg-rose-600 rounded-full">
                    <IonIcon name="receipt" size={18} color={'white'} style={{ padding: 5 }} />
                </View>
            </View>
            <View className="p-3">
                <View className="bg-white mt-3 rounded-lg px-3 py-4 p-4">
                    <Text className="text-base mb-2 font-poppins-semibold">Nominal <Text className="text-red-500">*</Text></Text>
                    <Controller
                        control={control}
                        name="nominal"
                        defaultValue={data?.nominal || ''} 
                        rules={{
                            required: 'Nominal wajib diisi',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Nominal harus berupa angka'
                            }
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700 font-poppins-regular text-black"
                                error={errors?.nominal?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />
                    <Text className="text-base mb-2 mt-4 font-poppins-semibold">Tipe <Text className="text-red-500">*</Text></Text>
                    <Controller
                        control={control}
                        name="tipe"
                        defaultValue={data?.tipe || ''}
                        rules={{ required: 'Tipe wajib diisi' }}
                        render={({ field: { value, onChange } }) => (
                            <View className="gap-4">
                                <View className="flex-row items-center">
                                    <Checkbox
                                        value={value === '%'}
                                        onValueChange={() => onChange('%')}
                                        color="#312e81"
                                    />
                                    <Text className="ml-2 font-poppins-regular">Persentase (%)</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Checkbox
                                        value={value === 'rp'}
                                        onValueChange={() => onChange('rp')}
                                        color="#312e81"
                                    />
                                    <Text className="ml-2 font-poppins-regular">Rupiah (Rp)</Text>
                                </View>
                            </View>
                        )}
                    />
                    {errors.tipe && (
                        <Text className="text-red-500 text-sm mt-1">{errors.tipe.message}</Text>
                    )}
    
                    <Text className="text-base mb-2 mt-6 font-poppins-semibold">Tempo Hari <Text className="text-red-500">*</Text></Text>
                    <Controller
                        control={control}
                        name="tempo"
                        defaultValue={data?.tempo || ''}
                        rules={{
                            required: 'Tempo Hari wajib diisi',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Tempo hari harus berupa angka'
                            }
                        }}
                        render={({ field: { onChange, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                value={value}
                                onChangeText={onChange}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                error={errors?.tempo?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />
    
                    <Button
                        labelStyle={{ fontFamily: "Poppins-Medium" }}
                        label="Simpan"
                        loading={isLoading}
                        onPress={handleSubmit(onSubmit)}
                        className="rounded-md bg-indigo-800 mt-5 mb-4"
                        disabled={isLoading}
                    />
                </View>
            </View>
            <View className="absolute bottom-10 self-center">
                <TextFooter />
            </View>
        </View>
    );
    
}

export default Denda

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 16,
    },
})