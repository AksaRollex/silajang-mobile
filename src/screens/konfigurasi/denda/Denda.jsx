import { StyleSheet } from 'react-native'
import { View, Text, Button, TextField, Checkbox } from "react-native-ui-lib";
import React, { useState } from 'react'
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import BackButton from '../../components/BackButton';
import { useHeaderStore } from '@/src/screens/main/Index'
import IonIcon from 'react-native-vector-icons/Ionicons';
import { TextFooter } from '../../components/TextFooter';
import * as Yup from 'yup';

const Denda = ({ navigation }) => {
    const { setHeader } = useHeaderStore();
    const [selectedType, setSelectedType] = useState('percentage'); // 'percentage' or 'rupiah'

    const {
        handleSubmit,
        control,
        formState: { errors },
        setValue,
    } = useForm();

    React.useLayoutEffect(() => {
        setHeader(false)
        return () => setHeader(true)
    }, [])

    const handleTypeChange = (type) => {
        setSelectedType(type);
    };

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
                        name="harga"
                        defaultValue=""
                        rules={{
                            required: "Harga is required",
                            pattern: {
                                value: /^[0-9.]*$/,
                                message: "Harga harus berupa number",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                value={value}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                error={errors?.harga?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />

                    <Text className="text-base mb-2 mt-4 font-poppins-semibold">Tipe <Text className="text-red-500">*</Text></Text>
                    <View className=" gap-4">
                        <View className="flex-row items-center">
                            <Checkbox
                                value={selectedType === 'percentage'}
                                onValueChange={() => handleTypeChange('percentage')}
                                color="#312e81"
                            />
                            <Text className="ml-2 font-poppins-regular">Persentase (%)</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Checkbox
                                value={selectedType === 'rupiah'}
                                onValueChange={() => handleTypeChange('rupiah')}
                                color="#312e81"
                            />
                            <Text className="ml-2 font-poppins-regular">Rupiah (Rp)</Text>
                        </View>
                    </View>

                    <Text className="text-base mb-2 mt-6 font-poppins-semibold">Tempo Hari <Text className="text-red-500">*</Text></Text>
                    <Controller
                        control={control}
                        name="harga"
                        defaultValue=""
                        rules={{
                            required: "Harga is required",
                            pattern: {
                                value: /^[0-9.]*$/,
                                message: "Harga harus berupa number",
                            },
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextField
                                style={{ fontFamily: "Poppins-Regular" }}
                                value={value}
                                className="py-3 px-5 rounded border-[1px] border-gray-700"
                                error={errors?.harga?.message}
                                keyboardType="numeric"
                            />
                        )}
                    />

                    <Button
                        labelStyle={{ fontFamily: "Poppins-Medium" }}
                        label="Simpan"
                        // loading={isLoading}
                        // onPress={handleSubmit(onSubmit)}
                        className="rounded-md bg-indigo-800 mt-5 mb-4"
                    // disabled={isLoading}
                    />
                </View>
            </View>
            <View className="absolute bottom-10 self-center">
                <TextFooter />
            </View>
        </View>
    )
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