import React, { useEffect, useState , useMemo} from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { RadioButton } from "react-native-paper";
import Toast from "react-native-toast-message";
import axios from "@/src/libs/axios";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Octicons from "react-native-vector-icons/Octicons";
import Foundation from "react-native-vector-icons/Foundation";
import Feather from "react-native-vector-icons/Feather";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {APP_URL} from "@env";

const bulans = [
    { id: 1, name: 'Januari' },
    { id: 2, name: 'Februari' },
    { id: 3, name: 'Maret' },
    { id: 4, name: 'April' },
    { id: 5, name: 'Mei' },
    { id: 6, name: 'Juni' },
    { id: 7, name: 'Juli' },
    { id: 8, name: 'Agustus' },
    { id: 9, name: 'September' },
    { id: 10, name: 'Oktober' },
    { id: 11, name: 'November' },
    { id: 12, name: 'Desember' },
];

export default function DetailKontrak({ route, navigation }) {
    const { uuid } = route.params
    const [data, setData] = useState(null)
    const [checked, setChecked] = useState()
    const [loading, setLoading] = useState(true)
    const [reportUrl, setreportUrl] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/administrasi/kontrak/${uuid}`)
                setData(response.data.data)
                if (
                    response.data.data &&
                    response.data.data.kesimpulan_kontrak !== undefined
                ) {
                    setChecked(response.data.data.kesimpulan_kontrak)
                }
                setLoading(false)
            } catch (error) {
                console.error("Error fetching data:", error)
                setLoading(false)
            }
        }

        fetchData()
    }, [uuid])

    const handleSave = value => {
        setChecked(value)
        saveStatus(value)
    }

    const saveStatus = async status => {
        const response = await axios.post(
            `/administrasi/kontrak/${uuid}/update`,
            {
                kesimpulan_kontrak: status,
            },
        )
    }

    const formattedBulan = useMemo(() => {
        if (data && data.kontrak && data.kontrak.bulan) {
            return data.kontrak.bulan
                .map((bulanId) => bulans.find((b) => b.id === parseInt(bulanId))?.name)
                .filter(Boolean)
                .join(', ');
        }
        return '';
    }, [data])

    const HandleDownloadFile = async () => {
        if (data?.kontrak?.dokumen_permohonan) {
            const fileUrl = `${APP_URL}/storage/${data.kontrak.dokumen_permohonan}`;
            const fileName = 'Dokumen Permohonan';
            const fileExtension = fileUrl.split('.').pop();
            const localFilePath = `${RNFS.DocumentDirectoryPath}/${fileName}.${fileExtension}`;
    
            try {
                const options = {
                    fromUrl: fileUrl,
                    toFile: localFilePath,
                };
    
                const result = await RNFS.downloadFile(options).promise;
    
                if (result.statusCode === 200) {
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'File downloaded successfully',
                    });
                } else {
                    throw new Error('Download failed');
                }
            } catch (error) {
                console.error('Error downloading file:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to download the file',
                });
            }
        } else {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Dokumen Permohonan tidak ditemukan',
            });
        }
    };
    

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading...</Text>
            </View>
        )
    }

    if (!data) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Data not found</Text>
            </View>
        )
    }

    return (
        <ScrollView
            contentContainerStyle={styles.scrollViewContainer}
            showsVerticalScrollIndicator={false}>
            <View className="flex-1 items-center bg-[#ececec]">
            {data ? (
                <>
                    <View className="bg-white rounded-[10px] p-[15px] w-[90%] shadow-md my-[10px]">
                        <View className="flex-row">
                            <TouchableOpacity 
                                className="bg-[#ef4444] w-[55px] h-[40px] rounded-[15px] justify-center items-center"
                                onPress={() => navigation.goBack()}
                            >
                                <MaterialCommunityIcons name="arrow-left" size={20} color="white" />
                            </TouchableOpacity>
                            <View>
                                <Text className="font-poppins-semibold text-[23px] text-black ml-[20px] mt-[5px]">Detail Kontrak</Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-[10px] p-[15px] w-[90%] shadow-md my-[10px]">
                        <Text className="text-[16px] font-poppins-semibold mb-[10px] text-black">Informasi Pemohon</Text>
                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <Feather name="user" size={28} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Customer</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.user.nama}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialCommunityIcons name="bank-outline" size={30} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Instansi</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.user.detail.instansi}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialCommunityIcons name="map-search-outline" size={26} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Alamat</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.user.detail.alamat}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <Feather name="phone" size={28} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">No. Telepon/WhatsApp</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.user.phone}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-[10px] p-[15px] w-[90%] shadow-md my-[10px]">
                        <Text className="text-[16px] font-poppins-semibold mb-[10px] text-black">Detail Permohonan</Text>
                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <FontAwesome name="building-o" size={30} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Industri</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.industri}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialCommunityIcons name="map-search-outline" size={26} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Alamat</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.alamat}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <Foundation name="clipboard-pencil" size={36} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Jenis Kegiatan Industri</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.kegiatan}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialIcons name="credit-card" size={28} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Jenis Pembayaran</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.pembayaran}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialIcons name="date-range" size={29} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Tanggal Permohonan</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.tanggal}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="bg-white rounded-[10px] p-[15px] w-[90%] shadow-md mt-[10px] mb-[100px]">
                        <Text className="text-[16px] font-poppins-semibold mb-[10px] text-black">Detail Kontrak</Text>
                        <View className="flex-row items-center mb-[15px]">
                            <TouchableOpacity 
                                className="bg-[#f2f2f2] p-[15px] rounded-[10px] mr-[10px]" 
                                onPress={() => HandleDownloadFile()}
                            >
                                <Octicons name="download" size={32} color="black" />
                            </TouchableOpacity>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Dokumen Permohonan</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">Klik icon untuk download</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialCommunityIcons name="clock-time-three-outline" size={30} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Masa Kontrak</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{formattedBulan}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <Foundation name="clipboard-pencil" size={36} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Perihal</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.kontrak.perihal}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <FontAwesome name="file-text-o" size={34} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Nomor Surat</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.kontrak.nomor_surat}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center mb-[15px]">
                            <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                <MaterialIcons name="date-range" size={29} color="#50cc96" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] text-[#666666]">Tanggal Permohonan</Text>
                                <Text className="text-[16px] font-poppins-semibold text-black">{data.kontrak.tanggal}</Text>
                            </View>
                        </View>

                        <Text className="text-[16px] font-poppins-semibold text-black">Kesimpulan Permohonan</Text>

                        <View className="flex-row justify-between my-[10px]">
                            <View className="flex-row items-center">
                            <RadioButton
                                value={0}
                                status={checked === 0 ? "checked" : "unchecked"}
                                onPress={() => handleSave(0)}
                            />
                            <Text className="text-[16px] text-black">Menunggu</Text>
                            </View>
                            <View className="flex-row items-center">
                            <RadioButton
                                value={1}
                                status={checked === 1 ? "checked" : "unchecked"}
                                onPress={() => handleSave(1)}
                            />
                            <Text className="text-[16px] text-black">Diterima</Text>
                            </View>
                            <View className="flex-row items-center">
                            <RadioButton
                                value={2}
                                status={checked === 2 ? "checked" : "unchecked"}
                                onPress={() => handleSave(2)}
                            />
                            <Text className="text-[16px] text-black">Ditolak</Text>
                            </View>
                        </View>
                    </View>
                </>
            ) : (
                <Text>Loading...</Text>
            )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        paddingVeritical: 10,
    }
})