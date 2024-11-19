import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FlatList, Text, View, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather";
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
import Feather from "react-native-vector-icons/Feather";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

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
            style={{ elevation: 4 }}>
            <View className="flex-row justify-between items-center">
                <View className="flex-col space-y-3 flex-1 mr-3">
                    <View>
                        <Text className="text-[15px] font-poppins-bold text-black">
                            {item.nama} {item.keterangan ? `(${item.keterangan})` : ''}
                        </Text>

                        <View className="flex-row items-center mt-1 flex-wrap">
                            <View
                                className={`px-2 py-1 rounded-md ${item.is_akreditasi ? 'bg-green-100' : 'bg-yellow-100'
                                    }`}
                            >
                                <Text
                                    className={`text-xs font-poppins-medium ${item.is_akreditasi ? 'text-green-500' : 'text-yellow-500'
                                        }`}
                                >
                                    {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'}
                                </Text>
                            </View>

                            {item.jenis_parameter?.nama && (
                                <Text className="text-xs font-poppins-regular text-gray-500 ml-2">
                                    {item.jenis_parameter.nama}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Text className="text-[15px] font-poppins-semibold text-black">{item.metode}</Text>
                    <Text className="text-[14px] font-poppins-regular text-black">{item.satuan}</Text>
                    <Text className="text-[14px] font-poppins-regular text-black">
                        {item.titik_permohonans_count > 0 ? `${item.titik_permohonans_count} Titik Permohonan` : ''}
                    </Text>
                </View>

                <MenuView
                    title="Menu Title"
                    actions={dropdownOptions}
                    onPressAction={({ nativeEvent }) => {
                        const selectedOption = dropdownOptions.find(
                            option => option.title === nativeEvent.event,
                        );
                        if (selectedOption) {
                            selectedOption.action(item);
                        }
                    }}
                    shouldOpenOnLongPress={false}>
                    <View>
                        <Entypo name="dots-three-vertical" size={18} color="#312e81" />
                    </View>
                </MenuView>
            </View>
        </View>
    ), [dropdownOptions]);

    return (
        <View className="flex-1 bg-gray-100">
            <View className="bg-gray-100 p-4 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <View className="left-1">
                        <BackButton action={() => navigation.goBack()} size={26} />
                    </View>
                    <Text className="text-xl font-poppins-bold text-black">Rekap Parameter</Text>

                    <TouchableOpacity
                        className="bg-red-100 py-2 px-4 rounded-lg"
                    >
                        <View className="flex-row">
                        <FontAwesome5Icon name="file-pdf" size={16} color="#ef4444" style={{marginRight: 5}}/>
                        <Text className="font-poppins-semibold text-red-500 text-[11px]" onPress={handlePreviewPDF}>Rekap Laporan</Text>
                        </View>
                    </TouchableOpacity>
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

            <Paginate
                ref={paginateRef}
                url="/report/parameter"
                payload={paginatePayload}
                renderItem={CardRekapParameter}
                className="mb-10"
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