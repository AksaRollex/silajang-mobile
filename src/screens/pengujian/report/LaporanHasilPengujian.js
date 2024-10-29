import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import axios from '@/src/libs/axios';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';

const currentYear = new Date().getFullYear();
const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
        years.push({ id: i, title: String(i) });
    }
    return years;
};

const months = [
    { id: 1, title: 'Januari' },
    { id: 2, title: 'Februari' },
    { id: 3, title: 'Maret' },
    { id: 4, title: 'April' },
    { id: 5, title: 'Mei' },
    { id: 6, title: 'Juni' },
    { id: 7, title: 'Juli' },
    { id: 8, title: 'Agustus' },
    { id: 9, title: 'September' },
    { id: 10, title: 'Oktober' },
    { id: 11, title: 'November' },
    { id: 12, title: 'Desember' },
];

const LaporanHasilPengujian = ({ navigation }) => {
    const [selectedYear, setSelectedYear] = useState(currentYear.toString());
    const [selectedMonth, setSelectedMonth] = useState('');
    const filterOptions = generateYears();
    const paginateRef = useRef();
    const queryClient = useQueryClient();
    const [modalVisible, setModalVisible] = useState(false);
    const [reportUrl, setReportUrl] = useState('');

    const getSelectedMonthName = () => {
        const month = months.find(m => m.id === selectedMonth);
        return month ? month.title : '';
    };

    const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
        onSuccess: () => {
            queryClient.invalidateQueries(['report/{uuid}/preview-lhu"']);
            paginateRef.current?.refetch();
        },
        onError: (error) => {
            console.error('Delete error:', error);
        }
    });

    useEffect(() => {
        const currentMonthId = new Date().getMonth() + 1;
        const currentMonth = months.find(month => month.id === currentMonthId);
        if (currentMonth) {
            setSelectedMonth(currentMonth.title);
        }
    }, []);

    const PreviewVerifikasi = async (item) => {
        try {
            const authToken = await AsyncStorage.getItem('@auth-token');
            setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`);
            setModalVisible(true);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to preview LHU',
            });
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const authToken = await AsyncStorage.getItem('@auth-token');
            const fileName = `LHU_${Date.now()}.pdf`;

            const downloadPath = Platform.OS === 'ios'
                ? `${RNFS.DocumentDirectoryPath}/${fileName}`
                : `${RNFS.DownloadDirectoryPath}/${fileName}`;

            const options = {
                fromUrl: reportUrl,
                toFile: downloadPath,
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            };

            const response = await RNFS.downloadFile(options).promise;

            if (response.statusCode === 200) {
                if (Platform.OS === 'android') {
                    await RNFS.scanFile(downloadPath);
                }

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: `PDF Berhasil Diunduh. ${Platform.OS === 'ios' ? 'You can find it in the Files app.' : `Saved as ${fileName} in your Downloads folder.`}`,
                });
            } else {
                throw new Error('Download failed');
            }
        } catch (error) {
            console.error('Download error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `PDF gagal diunduh: ${error.message}`,
            });
        }
    };

    const Rollback = async (uuid) => {
        try {
            const response = await axios.put(`/verifikasi/kepala-upt"/${uuid}/rollback`);

            if (response.data?.success) {
                queryClient.invalidateQueries(['report/{uuid}/preview-lhu"']);
                paginateRef.current?.refetch();

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'LHU berhasil di-rollback',
                });
            } else {
                throw new Error(response.data?.message || 'Gagal melakukan rollback');
            }
        } catch (error) {
            console.error('Rollback error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: `Gagal melakukan rollback: ${error.response?.data?.message || error.message}`,
            });
        }
    };

    const renderItem = ({ item }) => {
        const tteOptions = [
            {
                id: "DownloadTTE",
                title: "Download TTE",
                action: () => downloadReport(`/report/${item.uuid}/lhu/tte/download`)
            },
            {
                id: "AjukanTTESystem",
                title: "Ajukan TTE (System)",
                action: () => {
                    // Implementasi untuk ajukan TTE System
                }
            },
            item.file_lhu && {
                id: "AjukanTTEManual",
                title: "Ajukan TTE (Manual)",
                action: () => {
                    // Implementasi untuk ajukan TTE Manual
                }
            }
        ].filter(Boolean);

        const cetakLHUOptions = [
            {
                id: "CetakPDF",
                title: "PDF",
                action: () => downloadReport(`/report/${item.uuid}/lhu`)
            },
            {
                id: "CetakWORD",
                title: "WORD",
                action: () => downloadReportWord(`/report/${item.uuid}/lhu/word`)
            }
        ];

        const additionalOptions = [];
        if (item.status < 11) {
            additionalOptions.push({
                id: "Rollback",
                title: "Rollback",
                action: () => Rollback(item.uuid)
            });
        }

        if (item.status_tte == '1') {
            additionalOptions.push({
                id: "PreviewTTE",
                title: "Preview TTE",
                action: () => {
                    // Implementasi untuk preview TTE
                }
            });
        }

        return (
            <View className="my-2 bg-[#f8f8f8] rounded-md border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
                <View className="flex justify-between">
                        <Text className="text-[18px] font-poppins-semibold mb-1">{item.kode}</Text>
                        <Text className="text-[15px] font-poppins-semibold mb-2">{item.permohonan.user.nama}</Text>
                        <Text className="text-[14px] font-poppins-semibold mb-2">{item.lokasi}</Text>
                        <Text className="text-[12px] font-poppins-semibold mb-2">
                            Tanggal Selesai : <Text className="font-normal">{item.tanggal_selesai}</Text>
                        </Text>
                </View>
                <View className="flex-row justify-between">
                    <View className="flex-1 mr-4">
                        <Text className="text-[12px] font-poppins-semibold mb-2">
                            Tanggal TTE : <Text className="font-normal">{item.tanggal_tte}</Text>
                        </Text>
                        <Text className="text-[12px] font-poppins-semibold mb-2">
                            Status TTE : <Text className="font-normal">{item.status_tte}</Text>
                        </Text>
                    </View>
                    <View className="flex-col items-end justify-between">
                        <View className="bg-slate-100 rounded-md p-2 max-w-[150px] mb-2">
                            <Text className="text-[12px] text-indigo-600 font-poppins-semibold text-right" numberOfLines={2} ellipsizeMode="tail">
                                {item.text_status}
                            </Text>
                        </View>
                        <View className="flex-row justify-end mt-2">
                            <MenuView
                                title="TTE Options"
                                actions={tteOptions}
                                onPressAction={({ nativeEvent }) => {
                                    const selectedOption = tteOptions.find(option => option.id === nativeEvent.event);
                                    if (selectedOption && selectedOption.action) {
                                        selectedOption.action();
                                    }
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View className="flex-row p-2 bg-blue-500 m-1">
                                    <FontAwesome name="file-text-o" size={18} color="#fff" />
                                    <Text className="ml-2 text-white">TTE</Text>
                                </View>
                            </MenuView>

                            <MenuView
                                title="Cetak LHU Options"
                                actions={cetakLHUOptions}
                                onPressAction={({ nativeEvent }) => {
                                    const selectedOption = cetakLHUOptions.find(option => option.id === nativeEvent.event);
                                    if (selectedOption && selectedOption.action) {
                                        selectedOption.action();
                                    }
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View className="flex-row p-2 bg-green-500 m-1">
                                    <FontAwesome name="print" size={18} color="#fff" />
                                    <Text className="ml-2 text-white">Cetak LHU</Text>
                                </View>
                            </MenuView>

                            {additionalOptions.length > 0 && (
                                <MenuView
                                    title="Additional Options"
                                    actions={additionalOptions}
                                    onPressAction={({ nativeEvent }) => {
                                        const selectedOption = additionalOptions.find(option => option.id === nativeEvent.event);
                                        if (selectedOption && selectedOption.action) {
                                            selectedOption.action();
                                        }
                                    }}
                                    shouldOpenOnLongPress={false}
                                >
                                    <View className="flex-row p-2 bg-yellow-500 m-1">
                                        <FontAwesome name="ellipsis-v" size={18} color="#fff" />
                                        <Text className="ml-2 text-white">More</Text>
                                    </View>
                                </MenuView>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };


    return (
        <View className="bg-[#ececec] w-full h-full">
            <View className="p-4">
                <View className="flex-row items-center space-x-2">
                    <View className="flex-col w-full">
                        <View className="flex-row items-center space-x-2 mb-4">
                            <BackButton action={() => navigation.goBack()} size={26} />
                            <View className="absolute left-0 right-2 items-center">
                                <Text className="text-[20px] font-poppins-semibold">Laporan Hasil Pengujian</Text>
                            </View>
                        </View>

                        <View className="flex-col py-3">
                            <View className="bg-white p-3 rounded-lg">
                                <Text className="text-sm text-gray-600">
                                    {selectedMonth ? months.find(month => month.id === selectedMonth)?.title : 'Pilih Bulan'} {selectedYear}
                                </Text>
                            </View>
                        </View>

                        <View className="flex-row justify-end space-x-2">
                            <MenuView
                                title="Pilih Bulan"
                                actions={months.map(month => ({
                                    id: month.id.toString(),
                                    title: month.title,
                                }))}
                                onPressAction={({ nativeEvent }) => {
                                    const selectedOption = months.find(month => month.id.toString() === nativeEvent.event);

                                    if (selectedOption) {
                                        console.log('Selected Month:', selectedOption.title);
                                        setSelectedMonth(selectedOption.id);
                                    } else {
                                        console.log('Option not found');
                                    }
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View>
                                    <MaterialCommunityIcons
                                        name="calendar-month-outline"
                                        size={24}
                                        color="white"
                                        style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }}
                                    />
                                </View>
                            </MenuView>

                            <MenuView
                                title="Pilih Tahun"
                                actions={filterOptions.map(option => ({ id: option.id.toString(), title: option.title }))}
                                onPressAction={({ nativeEvent }) => {
                                    const selectedOption = filterOptions.find(option => option.title === nativeEvent.event);
                                    if (selectedOption) {
                                        setSelectedYear(selectedOption.title);
                                    }
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View>
                                    <MaterialCommunityIcons
                                        name="filter-menu-outline"
                                        size={24}
                                        color="white"
                                        style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }}
                                    />
                                </View>
                            </MenuView>
                        </View>
                    </View>
                </View>
            </View>

            <Paginate
                ref={paginateRef}
                url="/report"
                payload={{
                    bulan: selectedMonth,
                    status: [9, 10, 11],
                    page: 1,
                    search: '',
                    per: 10,
                    tahun: selectedYear,
                }}
                renderItem={renderItem}
                className="mb-14"
            />

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black bg-black/50">
                    <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
                        <View className="flex-row justify-between items-center p-4">
                            <Text className="text-lg font-poppins-semibold text-black">Preview Pdf</Text>
                            <TouchableOpacity onPress={handleDownloadPDF} className="p-2 rounded flex-row items-center">
                                <Feather name="download" size={21} color="black" />
                            </TouchableOpacity>
                        </View>
                        <Pdf
                            source={{ uri: reportUrl, cache: true }}
                            style={{ flex: 1 }}
                            trustAllCerts={false}
                        />
                        <View className="flex-row justify-between m-4">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <DeleteConfirmationModal />
        </View>
    );
};

export default LaporanHasilPengujian;