import React, { useEffect, useState, useMemo } from "react";
import { Text, View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Platform } from "react-native";
import { RadioButton } from "react-native-paper";
import Toast from "react-native-toast-message";
import axios from "@/src/libs/axios";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Octicons from "react-native-vector-icons/Octicons";
import Foundation from "react-native-vector-icons/Foundation";
import Feather from "react-native-vector-icons/Feather";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import ModalSuccess from "@/src/screens/components/ModalSuccess";

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
    const { uuid } = route.params;
    const [data, setData] = useState(null);
    const [checked, setChecked] = useState();
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

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

    useEffect(() => {
        fetchData()
    }, [uuid])

    const handleSave = async (value) => {
        try {
            setChecked(value);
            await saveStatus(value);
        } catch (error) {
            console.error("Error saving status:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal mengupdate status kontrak',
            });
        }
    };

    const saveStatus = async (status) => {
        try {
            await axios.post(`/administrasi/kontrak/${uuid}/update`, {
                kesimpulan_kontrak: status,
            });

            setIsUpdateModalVisible(true);
            await fetchData();

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Status kontrak berhasil diperbarui',
            });
        } catch (error) {
            console.error("Error saving status:", error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal menyimpan status',
            });
        }
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: "Storage Permission",
                        message: "Application needs access to your storage to download files",
                        buttonNeutral: "Ask Me Later",
                        buttonNegative: "Cancel",
                        buttonPositive: "OK"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.error(err);
                return false;
            }
        }
        return true;
    };

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
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Storage permission denied',
                });
                return;
            }

            setDownloading(true);
            const fileUrl = `${APP_URL}/storage/${data.kontrak.dokumen_permohonan}`;
            const fileName = 'Dokumen_Permohonan';
            const fileExtension = data.kontrak.dokumen_permohonan.split('.').pop();

            // Use the proper directory path based on platform
            const downloadPath = Platform.OS === 'ios'
                ? `${RNFS.DocumentDirectoryPath}/${fileName}.${fileExtension}`
                : `${RNFS.DownloadDirectoryPath}/${fileName}.${fileExtension}`;

            try {
                const options = {
                    fromUrl: fileUrl,
                    toFile: downloadPath,
                    background: true,
                    progressDivider: 1,
                };

                const download = RNFS.downloadFile(options);
                const result = await download.promise;

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
            } finally {
                setDownloading(false);
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
            <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
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
                        <View className="bg-white rounded-[10px] p-[15px] w-[90%] shadow-md my-[10px]" style={{ elevation: 4, shadowRadius: 5, shadowColor: 'black', }}>
                            <View className="flex-row">
                                <TouchableOpacity
                                    className="bg-[#ef4444] w-[55px] h-[46px] rounded-[15px] justify-center items-center"
                                    onPress={() => navigation.goBack()}
                                >
                                    <AntDesign name="arrowleft" size={20} color="white" />
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
                                    <Text className="text-[14px] font-poppins text-[#666666] font-poppins-regular">Customer</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.user.nama}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialCommunityIcons name="bank-outline" size={30} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Instansi</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.user.detail.instansi}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialCommunityIcons name="map-search-outline" size={26} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Alamat</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.user.detail.alamat}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <Feather name="phone" size={28} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">No. Telepon/WhatsApp</Text>
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
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Industri</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.industri}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialCommunityIcons name="map-search-outline" size={26} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Alamat</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.alamat}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <Foundation name="clipboard-pencil" size={36} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Jenis Kegiatan Industri</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.kegiatan}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialIcons name="credit-card" size={28} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Jenis Pembayaran</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.pembayaran}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialIcons name="date-range" size={29} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Tanggal Permohonan</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.tanggal}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-white rounded-[10px] p-[15px] w-[90%] shadow-md mt-[10px] mb-[100px]">
                            <Text className="text-[16px] font-poppins-semibold mb-[10px] text-black">Detail Kontrak</Text>
                            <View className="flex-row items-center mb-[15px]">
                                <TouchableOpacity
                                    className="bg-[#f2f2f2] p-[15px] rounded-[10px] mr-[10px]"
                                    onPress={HandleDownloadFile}
                                    disabled={downloading}
                                >
                                    {downloading ? (
                                        <ActivityIndicator size="small" color="#000" />
                                    ) : (
                                        <Octicons name="download" size={32} color="black" />
                                    )}
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Dokumen Permohonan</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">Klik icon untuk download</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialCommunityIcons name="clock-time-three-outline" size={30} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Masa Kontrak</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{formattedBulan}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <Foundation name="clipboard-pencil" size={36} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Perihal</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.kontrak.perihal}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <FontAwesome name="file-text-o" size={34} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Nomor Surat</Text>
                                    <Text className="text-[16px] font-poppins-semibold text-black">{data.kontrak.nomor_surat}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-[15px]">
                                <View className="bg-[#e8fff3] p-[10px] rounded-[10px] mr-[10px]">
                                    <MaterialIcons name="date-range" size={29} color="#50cc96" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[14px] text-[#666666] font-poppins-regular">Tanggal Permohonan</Text>
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
                                    <Text className="text-[16px] text-black font-poppins-medium">Menunggu</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <RadioButton
                                        value={1}
                                        status={checked === 1 ? "checked" : "unchecked"}
                                        onPress={() => handleSave(1)}
                                    />
                                    <Text className="text-[16px] text-black font-poppins-medium">Diterima</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <RadioButton
                                        value={2}
                                        status={checked === 2 ? "checked" : "unchecked"}
                                        onPress={() => handleSave(2)}
                                    />
                                    <Text className="text-[16px] text-black font-poppins-medium">Ditolak</Text>
                                </View>
                            </View>
                        </View>
                        <ModalSuccess
                            url={require("../../../../../assets/lottie/success-animation.json")}
                            modalVisible={isUpdateModalVisible}
                            title="Update Berhasil"
                            subTitle="Status kontrak berhasil diperbarui"
                            onClose={() => setIsUpdateModalVisible(false)}
                            duration={2800}
                        />
                    </>
                ) : (
                    <Text className="font-poppins-medium">Loading...</Text>
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