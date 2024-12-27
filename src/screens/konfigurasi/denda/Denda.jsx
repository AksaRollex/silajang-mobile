import { StyleSheet } from 'react-native'
import { View, Text, Button, TextField } from "react-native-ui-lib";
import React from 'react'
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import BackButton from '../../components/BackButton';
import { useHeaderStore } from '@/src/screens/main/Index'
import IonIcon from 'react-native-vector-icons/Ionicons';
import { TextFooter } from '../../components/TextFooter';


const Denda = ({ navigation }) => {
    const { setHeader } = useHeaderStore();
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
                <View className="bg-white mt-3 rounded-lg px-3 py-4">
                    <Text className="text-base mb-2 font-poppins-semibold">Nominal</Text>
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
                    <Text className="text-black font-poppins-semibold text-lg"></Text>

                    {/* <Text className="text-base mb-2 font-poppins-semibold">Tipe</Text> */}

                    <Text className="text-base mb-2 font-poppins-semibold">Tempo Hari</Text>
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
                    <Text className="text-black font-poppins-semibold text-lg"></Text>
                </View>
            </View>
            <View>
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