import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Alert, TextInput } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import axios from '@/src/libs/axios';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";

const CertificateBadge = ({ value }) => {
    return value ? (
        <View className="bg-blue-50 rounded-md py-1 px-2 max-w-[150px] mb-2">
            <Text className="text-blue-700 text-[10px] font-poppins-semibold text-right" numberOfLines={2} ellipsizeMode="tail">
                {`Salinan ke-${value}`}
            </Text>
        </View>
    ) : (
        <View className="bg-yellow-50 rounded-md py-1 px-2 max-w-[150px] mb-2">
            <Text className="text-yellow-700 text-[10px] font-poppins-semibold text-right">
                Belum Dicetak
            </Text>
        </View>
    );
};

const StatusTTEBadge = ({ status }) => {
    if (status === 1) {
        return (
            <View className="bg-green-50 rounded-md p-2">
                <Text className="text-green-700 text-[12px] font-poppins-semibold">
                    Berhasil
                </Text>
            </View>
        );
    }
    if (status === 0) {
        return (
            <View className="bg-red-50 rounded-md p-2">
                <Text className="text-red-700 text-[12px] font-poppins-semibold">
                    Gagal
                </Text>
            </View>
        );
    }
    return null;
};

const TTEModal = ({ visible, onClose, onSubmit, type }) => {
    const [formData, setFormData] = useState({
        tanda_tangan_id: '',
        passphrase: '',
        tipe: type
    });
    const [ttds, setTtds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTTDs = async () => {
            if (!visible) return;

            setIsLoading(true);
            try {
                const response = await axios.get('/konfigurasi/tanda-tangan');
                if (response.data?.data) {
                    setTtds(response.data.data.map(ttd => ({
                        id: ttd.id,
                        text: `${ttd.bagian} - ${ttd.user?.nama} (${ttd.user?.nik})`
                    })));
                }
            } catch (error) {
                console.error('Error fetching TTDs:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.response?.data?.message || 'Failed to fetch TTD options',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTTDs();
    }, [visible]);

    const handleSubmit = async () => {
        if (!formData.tanda_tangan_id || !formData.passphrase) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Mohon lengkapi semua field yang diperlukan',
            });
            return;
        }

        onSubmit(formData);
    };

    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-lg w-[90%] p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-poppins-semibold">Ajukan TTE LHU ({type})</Text>
                        <TouchableOpacity onPress={onClose}>
                            <AntDesign name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-poppins-bold mb-2 text-black">Tanda Tangan<Text className="text-red-500">*</Text></Text>
                        {isLoading ? (
                            <View className="border border-gray-300 rounded-md p-3">
                                <Text className="font-poppins-semibold text-black">Loading TTD options...</Text>
                            </View>
                        ) : (
                            <MenuView
                                title="Pilih TTD"
                                actions={ttds.map(ttd => ({
                                    id: ttd.id.toString(),
                                    title: ttd.text,
                                }))}
                                onPressAction={({ nativeEvent }) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        tanda_tangan_id: nativeEvent.event
                                    }));
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View className="border border-gray-300 rounded-md p-3">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="font-poppins-semibold">
                                            {ttds.find(t => t.id.toString() === formData.tanda_tangan_id)?.text || 'Pilih TTD'}
                                        </Text>
                                        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                                    </View>
                                </View>
                            </MenuView>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm text-black font-poppins-bold mb-2">
                            Passphrase<Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative">
                            <TextInput
                                className="border border-gray-300 rounded-md p-3 font-poppins-medium w-full pr-12"
                                secureTextEntry={!showPassword}
                                value={formData.passphrase}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, passphrase: text }))}
                                placeholder="Masukkan passphrase"
                            />
                            <TouchableOpacity
                                onPress={togglePasswordVisibility}
                                className="absolute right-4 top-4"
                            >
                                {showPassword ? (
                                    <Ionicons name="eye-outline" size={20} color="grey" />
                                ) : (
                                    <Ionicons name="eye-off-outline" size={20} color="grey" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row justify-end space-x-2">
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="bg-indigo-600 px-4 py-2 rounded-md flex-row items-center"
                        >
                            <Ionicons name="document-text-outline" size={20} color="white" className="mr-2" />
                            <Text className="text-white font-poppins-semibold ml-2">Kirim</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

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
    const [tteModalVisible, setTteModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [tteType, setTteType] = useState('system');

    const handleTTESubmit = async (formData) => {
        try {
            // Convert formData to query parameters
            const queryParams = new URLSearchParams({
                tanda_tangan_id: formData.tanda_tangan_id,
                passphrase: formData.passphrase,
                tipe: formData.tipe
            }).toString();

            const response = await axios.get(`/report/${selectedItem}/kendali-mutu/tte?${queryParams}`);

            if (response.data?.success) {
                const authToken = await AsyncStorage.getItem('@auth-token');
                setReportUrl(`${APP_URL}/api/v1/report/${selectedItem}/lhu/tte?token=${authToken}&tanda_tangan_id=${formData.tanda_tangan_id}&passphrase=${btoa(formData.passphrase)}`);
                setModalVisible(true);

                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'TTE request submitted successfully',
                });
                setTteModalVisible(false);
                paginateRef.current?.refetch();
            }
        } catch (error) {
            console.error('Error submitting TTE request:', error.response);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to submit TTE request',
            });
        }
    };

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
        // Set bulan saat ini sebagai nilai default
        const currentMonthId = new Date().getMonth() + 1;
        setSelectedMonth(currentMonthId); // Langsung set number, bukan title
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

                // Use FileViewer with more comprehensive error handling
                try {
                    await FileViewer.open(downloadPath, {
                        showOpenWithDialog: false,
                        mimeType: 'application/pdf'
                    });
                } catch (openError) {
                    console.log('Error opening file with FileViewer:', openError);

                    // Fallback for Android using Intents
                    if (Platform.OS === 'android') {
                        try {
                            const intent = new android.content.Intent(
                                android.content.Intent.ACTION_VIEW
                            );
                            intent.setDataAndType(
                                android.net.Uri.fromFile(new java.io.File(downloadPath)),
                                'application/pdf'
                            );
                            intent.setFlags(
                                android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP |
                                android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
                            );

                            await ReactNative.startActivity(intent);
                        } catch (intentError) {
                            console.log('Intent fallback failed:', intentError);

                            // Last resort: show file location
                            Toast.show({
                                type: "info",
                                text1: "PDF Downloaded",
                                text2: `File saved at: ${downloadPath}`,
                            });
                        }
                    } else {
                        // Fallback for iOS
                        Toast.show({
                            type: "info",
                            text1: "PDF Downloaded",
                            text2: `File saved at: ${downloadPath}`,
                        });
                    }
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
            Boolean(item.tte_lhu) && {
                id: "DownloadTTE",
                title: "Download TTE",
                icon: () => <FontAwesome5Icon name="file-pdf" size={16} color="#dc3545" />,
                action: async () => {
                    try {
                        const authToken = await AsyncStorage.getItem('@auth-token');
                        const downloadUrl = `${APP_URL}/api/v1/report/${item.uuid}/lhu/tte/download?token=${authToken}`;

                        setReportUrl(downloadUrl);
                        setModalVisible(true);
                    } catch (error) {
                        Toast.show({
                            type: 'error',
                            text1: 'Error',
                            text2: 'Failed to download TTE',
                        });
                    }
                }
            },

            {
                id: "AjukanTTESystem",
                title: "Ajukan TTE (System)",
                icon: () => <FontAwesome5Icon name="file-signature" size={16} color="#28a745" />,
                action: () => {
                    setSelectedItem(item.uuid);
                    setTteType('system');
                    setTteModalVisible(true);
                }
            },

            Boolean(item.file_lhu) && {
                id: "AjukanTTEManual",
                title: "Ajukan TTE (Manual)",
                icon: () => <FontAwesome5Icon name="file-signature" size={16} color="#28a745" />,
                action: () => {
                    setSelectedItem(item.uuid);
                    setTteType('manual');
                    setTteModalVisible(true);
                }
            }
        ].filter(Boolean);

        const handlePreviewLHU = async () => {
            try {
                const authToken = await AsyncStorage.getItem('@auth-token');
                setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/lhu?token=${authToken}`);
                setModalVisible(true);
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to preview LHU',
                });
            }
        };

        const handleRollback = () => {
            Alert.alert(
                "Konfirmasi Rollback",
                "Apakah Anda yakin ingin melakukan rollback?",
                [
                    {
                        text: "Batal",
                        style: "cancel"
                    },
                    {
                        text: "Ya",
                        onPress: () => {
                            Rollback(item.uuid);
                            Toast.show({
                                type: 'success',
                                text1: 'Success',
                                text2: 'Rollback berhasil dilakukan',
                            });
                        },
                        style: "destructive"
                    }
                ],
                { cancelable: false }
            );
        };

        return (
            <View className="my-3 bg-white rounded-lg border-t-[6px] border-indigo-900 p-4 mx-2" style={{
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4
            }}>
                <View className="border-b border-gray-100 pb-3 mb-3">
                    <View className="flex-row justify-between items-center mb-3">
                        <View>
                            <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Kode</Text>
                            <Text className="text-md font-poppins-semibold text-black">{item.kode}</Text>
                        </View>
                        <CertificateBadge value={item.sertifikat} />
                    </View>
                    <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
                    <Text className="text-md font-poppins-semibold text-black mb-4">{item.permohonan.user.nama}</Text>
                    <Text className="text-xs font-poppins-regular text-gray-500">Titik Uji/Lokasi</Text>
                    <Text className="text-[14px] font-poppins-semibold text-black">{item.lokasi}</Text>
                </View>

                <View className="flex-row justify-between mb-4">
                    <View className="flex-1">
                        <View className="mb-2">
                            <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Tanggal Selesai</Text>
                            <Text className="text-md font-poppins-semibold text-black">{item.tanggal_selesai}</Text>
                        </View>
                        <View className="mb-2">
                            <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Tanggal TTE</Text>
                            <Text className="text-md font-poppins-semibold text-black">{item.tanggal_tte || '-'}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-xs font-poppins-regular text-gray-500 mr-2">Status TTE:</Text>
                            <StatusTTEBadge status={item.status_tte} />
                        </View>
                    </View>

                    <View className="flex-col items-end justify-between">
                        <View className="bg-indigo-100 rounded-md px-2 py-1 mb-3">
                            <Text className="text-[10px] text-indigo-600 font-poppins-semibold text-right"
                                numberOfLines={2}
                                ellipsizeMode="tail">
                                {item.text_status}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex-row justify-end pt-2 border-t border-gray-100">
                    <MenuView
                        title="TTE Options"
                        actions={tteOptions}
                        onPressAction={({ nativeEvent }) => {
                            const selectedOption = tteOptions.find(option => option.id === nativeEvent.event);
                            if (selectedOption?.action) selectedOption.action();
                        }}
                        shouldOpenOnLongPress={false}
                    >
                        <View className="flex-row items-center p-2 bg-green-500 rounded-md mr-2">
                            <FontAwesome name="file-text-o" size={16} color="#fff" />
                            <Text className="ml-down2 text-white text-[13px] font-poppins-semibold mx-2">TTE</Text>
                            <Ionicons name="chevron-down" size={16} color="#fff" />
                        </View>
                    </MenuView>

                    {Boolean(item.file_lhu) && (
                        <TouchableOpacity
                            onPress={handlePreviewLHU}
                            className="flex-row items-center p-2 bg-indigo-100 rounded-md"
                        >
                            <FontAwesome name="eye" size={16} color="#4f46e5" />
                            <Text className="ml-2 text-indigo-600 text-[13px] font-poppins-semibold"> Preview LHU</Text>
                        </TouchableOpacity>
                    )}

                    {item.status < 11 && (
                        <TouchableOpacity
                            onPress={handleRollback}
                            className="ml-2 flex-row items-center p-2 bg-amber-100 rounded-md font-poppins-semibold"
                        >
                            <AntDesign name="sync" size={16} color="#fbbf24" />
                        </TouchableOpacity>
                    )}
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
                                <Text className="text-[20px] font-poppins-semibold text-black">Laporan Hasil Pengujian</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-end space-x-2">
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
                                <View >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            backgroundColor: "white",
                                            padding: 12,
                                            borderRadius: 8,
                                            width: 185,
                                            borderColor: "#d1d5db",
                                            borderWidth: 1
                                        }}>
                                        <Text style={{ color: "black", flex: 1, textAlign: "center", fontFamily: "Poppins-SemiBold" }}>
                                            {`Tahun: ${selectedYear}`}
                                        </Text>
                                        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                                    </View>
                                </View>
                            </MenuView>

                            <MenuView
                                title="Pilih Bulan"
                                actions={months.map(month => ({
                                    id: month.id.toString(),
                                    title: month.title,
                                }))}
                                onPressAction={({ nativeEvent }) => {
                                    const monthId = parseInt(nativeEvent.event); // Parse string ke number
                                    setSelectedMonth(monthId);
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            backgroundColor: "white",
                                            padding: 12,
                                            borderRadius: 8,
                                            width: 185,
                                            borderColor: "#d1d5db",
                                            borderWidth: 1
                                        }}>
                                        <Text style={{ color: "black", flex: 1, textAlign: "center", fontFamily: "Poppins-SemiBold" }}>
                                            {`Bulan: ${months.find(m => m.id === selectedMonth)?.title || 'Pilih'}`}
                                        </Text>
                                        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                                    </View>
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
                            <Text className="text-lg font-poppins-semibold text-black">Preview PDF</Text>
                            <TouchableOpacity onPress={handleDownloadPDF} className="p-2 rounded flex-row items-center">
                                <Feather name="download" size={21} color="black" />
                            </TouchableOpacity>
                        </View>

                        {reportUrl ? (
                            <Pdf
                                source={{ uri: reportUrl, cache: true }}
                                style={{ flex: 1 }}
                                trustAllCerts={false}
                            />
                        ) : (
                            <View className="flex-1 justify-center items-center">
                                <Text className="text-xl font-poppins-semibold text-red-500">404 | File not found</Text>
                            </View>
                        )}

                        <View className="flex-row justify-between m-4">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            <TTEModal
                visible={tteModalVisible}
                onClose={() => setTteModalVisible(false)}
                onSubmit={handleTTESubmit}
                type={tteType}
            />

            <DeleteConfirmationModal />
        </View>
    );
};

export default LaporanHasilPengujian;   