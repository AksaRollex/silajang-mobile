import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FlatList, Text, View, ActivityIndicator, Modal, TouchableOpacity, ScrollView } from "react-native";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDelete } from "@/src/hooks/useDelete";
import SearchInput from "@/src/screens/components/SearchInput";
import Paginate from "@/src/screens/components/Paginate";
import BackButton from "@/src/screens/components/BackButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from 'moment';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { APP_URL } from "@env";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { useHeaderStore } from "../../main/Index";
import { TextFooter } from "@/src/screens/components/TextFooter";

const RekapParameter = ({ navigation }) => {
    const queryClient = useQueryClient();
    const paginateRef = useRef();
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateType, setDateType] = useState('start');
    const [dateRange, setDateRange] = useState({
        start: moment().startOf('month').format('YYYY-MM-DD'),
        end: moment().format('YYYY-MM-DD')
    });
    const [shouldRefresh, setShouldRefresh] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [reportUrl, setReportUrl] = useState('');
    const { setHeader } = useHeaderStore();

    React.useLayoutEffect(() => {
        setHeader(false)

        return () => setHeader(true)
    }, [])


    // Memoize the payload to prevent unnecessary re-renders
    const paginatePayload = useMemo(() => ({
        start: dateRange.start,
        end: dateRange.end
    }), [dateRange.start, dateRange.end]);

    const dropdownOptions = useMemo(() => ([
        {
            id: "Detail",
            title: "Detail",
            action: item => {
                setSelectedItem(item);
                setShowDetailModal(true);
            },
            icon: 'info'
        },
    ]), []);

    const handleDownloadPDF = async () => {
        try {
            const authToken = await AsyncStorage.getItem('@auth-token');
            const fileName = `RekapParameter_${Date.now()}.pdf`;
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

            const result = await RNFS.downloadFile(options).promise;
            if (result.statusCode === 200) {
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

    const handlePreviewPDF = async () => {
        try {
            const authToken = await AsyncStorage.getItem('@auth-token');
            setReportUrl(`${APP_URL}/api/v1/report/parameter?token=${authToken}&start=${dateRange.start}&end=${dateRange.end}`);
            setModalVisible(true);
        } catch (error) {
            console.error('Preview error:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Gagal memuat preview PDF',
            });
        }
    };

    const handleDateSelection = (type) => {
        setDateType(type);
        setShowDatePicker(true);
    };

    const handleDateConfirm = (date) => {
        const formattedDate = moment(date).format('YYYY-MM-DD');
        setDateRange(prev => ({
            ...prev,
            [dateType]: formattedDate
        }));
        setShowDatePicker(false);

        if (dateType === 'start') {
            setTimeout(() => {
                setDateType('end');
                setShowDatePicker(true);
            }, 500);
        } else {
            setShouldRefresh(true);
        }
    };

    useEffect(() => {
        if (shouldRefresh) {
            paginateRef.current?.refetch();
            setShouldRefresh(false);
        }
    }, [shouldRefresh]);

    const DetailModal = useMemo(() => () => (
        <Modal
            visible={showDetailModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDetailModal(false)}
        >
            <View className="flex-1 bg-black/50 justify-center">
                <View className="bg-white mx-4 rounded-lg p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <View>
                            <Text className="text-[15px] font-poppins-bold text-black">
                                {selectedItem?.nama}
                                {selectedItem?.keterangan && ` (${selectedItem.keterangan})`}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className={`px-2 py-1 rounded ${selectedItem?.is_akreditasi ? 'bg-green-100' : 'bg-yellow-100'} font-poppins-regular`}>
                                    <Text className={`text-xs ${selectedItem?.is_akreditasi ? 'text-green-500' : 'text-yellow-500'} font-poppins-regular`}>
                                        {selectedItem?.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'}
                                    </Text>
                                </View>
                                <Text className="text-gray-500 text-xs ml-2 font-poppins-regular">
                                    {selectedItem?.jenis_parameter?.nama}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View className="border-b-2 border-gray-200 mb-3"></View>
                    <FlatList
                        data={selectedItem?.titik_permohonans || []}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        renderItem={({ item, index }) => (
                            <View className="flex-row mb-6">
                                <Text className="text-lg mr-4 font-poppins-regular">
                                    {index + 1}.
                                </Text>
                                <View className="flex-1">
                                    <Text className="text-gray-500 font-poppins-regular mb-1">
                                        {item.tanggal}
                                    </Text>
                                    <View className="flex-row flex-wrap">
                                        <Text className="text-sm font-poppins-semibold text-black">
                                            {item.kode.includes('Belum') ? '(Belum Ditetapkan)' : `(${item.kode})`}
                                        </Text>
                                        <Text className="text-sm font-poppins-semibold text-black ml-1 flex-shrink">
                                            {item.lokasi}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                        className="max-h-[400px]"
                    />

                    <TouchableOpacity
                        className="bg-gray-200 py-2 px-4 rounded-lg mt-4"
                        onPress={() => setShowDetailModal(false)}
                    >
                        <Text className="text-center font-poppins-semibold">Tutup</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    ), [selectedItem, showDetailModal]);

    const CardRekapParameter = useMemo(() => ({ item }) => (
        <View
            className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
            style={{ elevation: 4 }}
        >
            <View>
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                        {item.is_akreditasi ? (
                            <MaterialIcons name="verified" size={20} color="#16a34a" />
                        ) : null}
                    </View>
                    <View className={`rounded-md ${item.is_akreditasi ? 'bg-green-200' : 'bg-yellow-100'}`}>
                        <Text
                            className={`text-xs font-poppins-medium px-1 py-1 ${item.is_akreditasi ? 'text-green-600' : 'text-yellow-400'
                                }`}
                        >
                            {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'}
                        </Text>
                    </View>
                </View>

                <View className="mb-4">
                    <View className="flex-row items-center flex-wrap mb-1">
                        <Text className="text-lg font-poppins-bold text-black">{item.nama}</Text>
                        {item.keterangan ? (
                            <Text className="text-sm font-poppins-regular text-gray-600 ml-2">
                                ({item.keterangan})
                            </Text>
                        ) : null}
                    </View>
                    {item.jenis_parameter ? (
                        <Text className="text-sm font-poppins-regular text-gray-500">
                            {item.jenis_parameter.nama}
                        </Text>
                    ) : null}
                </View>

                <View className="flex-row flex-wrap mb-4">
                    <View className="w-1/2 mb-3 pr-4">
                        <Text className="text-xs font-poppins-regular text-gray-500">Metode</Text>
                        <Text className="text-md font-poppins-semibold text-black mt-1">{item.metode}</Text>
                    </View>
                    <View className="w-1/2 mb-3 pl-4">
                        <Text className="text-xs font-poppins-regular text-gray-500">Satuan</Text>
                        <Text className="text-md font-poppins-medium text-black mt-1">{item.satuan}</Text>
                    </View>
                    <View className="w-1/2 pr-4">
                        <Text className="text-xs font-poppins-regular text-gray-500">
                            Titik Permohonan
                        </Text>
                        <Text className="text-md font-poppins-medium text-black mt-1">
                            {item.titik_permohonans_count > 0 ? `${item.titik_permohonans_count} Titik` : '-'}
                        </Text>
                    </View>
                </View>

                <View className="h-[1px] bg-gray-300" />

                <View className="flex-row justify-end gap-2 mt-3">
                    <TouchableOpacity
                        onPress={() => {
                            setSelectedItem(item);
                            setShowDetailModal(true);
                        }}
                        className="flex-row items-center bg-[#312e81] px-3 py-2 rounded"
                    >
                        <Text className="text-white ml-1 text-xs font-poppins-medium">
                            Detail
                        </Text>
                        <Feather name="chevrons-right" size={15} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    ), [dropdownOptions]);

    return (
        <View className="bg-[#ececec] w-full h-full">
            <View
                className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
                style={{ backgroundColor: '#fff' }}
            >
                <View className="flex-row items-center">
                    <Ionicons
                        name="arrow-back-outline"
                        onPress={() => navigation.goBack()}
                        size={25}
                        color="#312e81"
                    />
                    <Text className="text-[20px] font-poppins-medium text-black ml-4">Rekap Parameter</Text>
                </View>
                <View className="bg-emerald-500 rounded-full">
                    <Ionicons
                        name="filter"
                        size={18}
                        color={'white'}
                        style={{ padding: 5 }}
                    />
                </View>
            </View>


            <TouchableOpacity
                onPress={() => handleDateSelection('start')}
                className="mx-4 mb-4 mt-4 bg-white p-3 rounded-lg border border-gray-300 ">
                <Text className="text-center font-poppins-semibold text-black">
                    {`${dateRange.start} to ${dateRange.end}`}
                </Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={showDatePicker}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={() => setShowDatePicker(false)}
                date={new Date(dateType === 'start' ? dateRange.start : dateRange.end)}
            />

            <ScrollView>
                <Paginate
                    ref={paginateRef}
                    url="/report/parameter"
                    payload={paginatePayload}
                    renderItem={CardRekapParameter}
                    className="bottom-2"
                />
                <View className="mt-12 mb-8">
                    <TextFooter />
                </View>
            </ScrollView>

            <TouchableOpacity
                onPress={handlePreviewPDF}
                style={{
                    position: 'absolute',
                    bottom: 75,
                    right: 20,
                    backgroundColor: '#dc2626',
                    borderRadius: 50,
                    width: 55,
                    height: 55,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 5,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    zIndex: 1000
                }}>
                <FontAwesome5Icon name="file-pdf" size={24} color="#fff" />
            </TouchableOpacity>

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
                            <TouchableOpacity
                                onPress={() => {
                                    handleDownloadPDF();
                                    setModalVisible(false);
                                }}
                                className="p-2 rounded flex-row items-center"
                            >
                                <Feather name="download" size={21} color="black" />
                            </TouchableOpacity>
                        </View>
                        <Pdf
                            source={{ uri: reportUrl, cache: true }}
                            style={{ flex: 1 }}
                            trustAllCerts={false}
                        />
                        <View className="flex-row justify-between m-4">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="bg-[#dc3546] p-2 rounded flex-1 ml-2"
                            >
                                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <DetailModal />
        </View>
    );
};

export default React.memo(RekapParameter);