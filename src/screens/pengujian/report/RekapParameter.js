import React, { useState, useRef, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions, FlatList, ActivityIndicator } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { useHeaderStore } from "../../main/Index";
import { TextFooter } from "@/src/screens/components/TextFooter";
import { APP_URL } from "@env";
import Paginate from "@/src/screens/components/Paginate";

const RekapParameter = ({ navigation }) => {
    const queryClient = useQueryClient();
    const paginateRef = useRef();
    const [selectedItem, setSelectedItem] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedStartDate, setSelectedStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [selectedEndDate, setSelectedEndDate] = useState(moment().format('YYYY-MM-DD'));
    const [modalVisible, setModalVisible] = useState(false);
    const [reportUrl, setReportUrl] = useState('');
    const { setHeader } = useHeaderStore();
    const [pdfError, setPdfError] = useState(false);
    const [pdfLoaded, setPdfLoaded] = useState(false);

    useEffect(() => {
        if (modalVisible) {
            setPdfLoaded(false);
            setPdfError(false);
        }
    }, [modalVisible]);

    React.useLayoutEffect(() => {
        setHeader(false)
        return () => setHeader(true)
    }, [])


    // Memoize the payload to prevent unnecessary re-renders
    const windowWidth = Dimensions.get('window').width;
    const dayWidth = (windowWidth - 80) / 7;

    const customStyles = {
        calendarContainer: {
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 12,
            width: '100%',
        },
        monthTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            color: '#312e81',
            fontSize: 16,
            textAlign: 'center',
        },
        yearTitleStyle: {
            fontFamily: 'Poppins-SemiBold',
            color: '#312e81',
            fontSize: 16,
            textAlign: 'center',
        },
        dayLabels: {
            width: dayWidth,
            textAlign: 'center',
            color: '#6b7280',
            fontFamily: 'Poppins-Medium',
            fontSize: 13,
        },
        selectedDayStyle: {
            backgroundColor: '#e0e7ff',
        },
        selectedDayTextStyle: {
            color: 'white',
            fontWeight: '600',
        },
        dateNameStyle: {
            color: '#1f2937',
            fontFamily: 'Poppins-Regular',
            fontSize: 14,
            textAlign: 'center',
        },
        dayShape: {
            width: dayWidth - 8,
            height: dayWidth - 8,
            borderRadius: (dayWidth - 8) / 2,
            justifyContent: 'center',
            alignItems: 'center',
        },
    };

    const onDateChange = (date, type) => {
        if (date) {
            const formattedDate = date.toISOString().split('T')[0];
            if (type === 'START_DATE') {
                setSelectedStartDate(formattedDate);
            } else if (type === 'END_DATE') {
                setSelectedEndDate(formattedDate);
            }
        }
    };

    const getCustomDatesStyles = () => {
        const customDatesStyles = [];
        const startDate = moment(selectedStartDate);
        const endDate = moment(selectedEndDate);

        for (let m = moment(startDate); m.diff(endDate, 'days') <= 0; m.add(1, 'days')) {
            customDatesStyles.push({
                date: m.clone().toDate(),
                style: { backgroundColor: '#e8e8e8' },
                textStyle: { color: '#000' },
            });
        }
        return customDatesStyles;
    };

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
            setReportUrl(`${APP_URL}/api/v1/report/parameter?token=${authToken}&start=${selectedStartDate}&end=${selectedEndDate}`);
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

    // const handleDateSelection = (type) => {
    //     setDateType(type);
    //     setShowDatePicker(true);
    // };

    // const handleDateConfirm = (date) => {
    //     const formattedDate = moment(date).format('YYYY-MM-DD');
    //     setDateRange(prev => ({
    //         ...prev,
    //         [dateType]: formattedDate
    //     }));
    //     setShowDatePicker(false);

    //     if (dateType === 'start') {
    //         setTimeout(() => {
    //             setDateType('end');
    //             setShowDatePicker(true);
    //         }, 500);
    //     } else {
    //         setShouldRefresh(true);
    //     }
    // };

    // useEffect(() => {
    //     if (shouldRefresh) {
    //         paginateRef.current?.refetch();
    //         setShouldRefresh(false);
    //     }
    // }, [shouldRefresh]);

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
                        className="bg-red-500 py-2 px-4 rounded-lg mt-4"
                        onPress={() => setShowDetailModal(false)}
                    >
                        <Text className="text-center font-poppins-semibold text-white">Tutup</Text>
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
                        className="flex-row items-center bg-indigo-500 px-3 py-2 rounded"
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
                onPress={() => setShowCalendar(true)}
                className="mx-4 mb-4 mt-4 bg-white p-3 rounded-lg">
                <Text className="text-center text-black font-poppins-semibold">
                    {`${selectedStartDate} to ${selectedEndDate}`}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={showCalendar}
                onRequestClose={() => setShowCalendar(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-lg w-11/12 p-4">
                        <CalendarPicker
                            allowRangeSelection={true}
                            onDateChange={onDateChange}
                            selectedDayColor="#3730a3"
                            selectedDayTextColor="#ffffff"
                            todayBackgroundColor="#e0e7ff"
                            todayTextStyle={{ color: '#312e81' }}
                            textStyle={customStyles.dateNameStyle}
                            customDatesStyles={getCustomDatesStyles()}
                            monthTitleStyle={customStyles.monthTitleStyle}
                            yearTitleStyle={customStyles.yearTitleStyle}
                            weekdays={['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']}
                            weekdaysStyle={{
                                borderRadius: 4,
                                paddingVertical: 8,
                                marginBottom: 8,
                            }}
                            dayLabelsWrapper={{
                                borderTopWidth: 0,
                                borderBottomWidth: 0,
                                paddingTop: 10,
                                paddingBottom: 10,
                            }}
                            previousComponent={
                                <View className="bg-indigo-50 p-2 rounded-full">
                                    <Ionicons name="chevron-back" size={20} color="#312e81" />
                                </View>
                            }
                            nextComponent={
                                <View className="bg-indigo-50 p-2 rounded-full">
                                    <Ionicons name="chevron-forward" size={20} color="#312e81" />
                                </View>
                            }
                            
                            // customDayHeaderStyles={{
                            //     textStyle: {
                            //         fontFamily: 'Poppins-Medium',
                            //         fontSize: 13,
                            //         color: '#6b7280',
                            //         textAlign: 'center',
                            //     }
                            // }}
                            dayShape={customStyles.dayShape}
                            selectedDayStyle={customStyles.selectedDayStyle}
                            selectedDayTextStyle={customStyles.selectedDayTextStyle}
                            width={windowWidth - 64}
                            height={windowWidth * 0.9}
                            minDate={new Date(2023, 0, 1)}
                            maxDate={new Date(2024, 11, 31)}
                            scaleFactor={375}
                        />

                        <TouchableOpacity
                            onPress={() => setShowCalendar(false)}
                            className="bg-indigo-900 p-3 rounded-lg mt-4"
                        >
                            <Text className="text-white text-center font-poppins-semibold">
                                Tutup
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView>
                <Paginate
                    ref={paginateRef}
                    url="/report/parameter"
                    payload={{
                        start: selectedStartDate,
                        end: selectedEndDate,
                    }}
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
                    bottom: 25,
                    right: 15,
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
                onRequestClose={() => setModalVisible(false)}>
                <View className="flex-1 justify-center items-center bg-black bg-black/50">
                    <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
                        <View className="flex-row justify-between items-center p-4">
                            <Text className="text-lg font-poppins-semibold text-black">Preview Pdf</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    handleDownloadPDF();
                                    setModalVisible(false);
                                }}
                                className="p-2 rounded flex-row items-center">
                                <Feather name="download" size={21} color="black" />
                            </TouchableOpacity>
                        </View>

                        {!pdfLoaded && !pdfError && (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ececec" }}>
                                <ActivityIndicator size="large" color="#312e81" style={{ top: 180 }} />
                                <Text className="mt-2 text-black font-poppins-medium" style={{ top: 175 }}>Memuat PDF...</Text>
                            </View>
                        )}

                        {!pdfError && (
                            <Pdf
                                key={reportUrl}
                                source={{ uri: reportUrl, cache: true }}
                                style={{
                                    flex: 1,
                                }}
                                trustAllCerts={false}
                                onLoadComplete={(numberOfPages) => {
                                    setPdfLoaded(true);
                                    console.log(`Number Of Page: ${numberOfPages}`);
                                }}
                                onPageChanged={(page, numberOfPages) => {
                                    console.log(`Current page ${page}`);
                                }}
                                onError={(error) => {
                                    setPdfError(true);
                                    setPdfLoaded(false);
                                    console.log('PDF loading error:', error);
                                }}
                            />
                        )}


                        {pdfError && (
                            <View className="flex-1 justify-center items-center self-center p-4">
                                <Text className="text-md text-black font-poppins-medium">PDF Tidak Ditemukan</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setModalVisible(false);
                                        setPdfError(false);
                                    }}
                                    className="bg-red-100 py-2 px-5 rounded mt-1 self-center">
                                    <Text className="text-red-500 font-poppins-medium">Tutup</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {pdfLoaded && (
                            <View className="flex-row justify-between m-4">
                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                                    <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <DetailModal />
        </View>
    );
};

export default React.memo(RekapParameter);