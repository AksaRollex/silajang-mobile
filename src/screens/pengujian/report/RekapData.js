import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from 'moment';
import { useQueryClient } from '@tanstack/react-query';
import CalendarPicker from 'react-native-calendar-picker';
import Paginate from "@/src/screens/components/Paginate";
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FileViewer from 'react-native-file-viewer';
import { useHeaderStore } from '../../main/Index';
import { TextFooter } from "@/src/screens/components/TextFooter";
import { fonts } from '@rneui/base';

const CardItem = ({ item }) => (
  <View className="mb-4 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
    <View className="flex-row items-center">
      <View style={{ width: "90%" }}>
        <View className="flex-col space-y-2">
          <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
            <Text className="text-md font-poppins-semibold text-black">
              {item.kode}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
            <Text className="text-md font-poppins-semibold text-black"
              numberOfLines={2}>
              {item.permohonan?.user?.nama}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Lokasi</Text>
            <Text className="text-md font-poppins-semibold text-black"
              numberOfLines={2}>
              {item.lokasi}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Status</Text>
            <View className="bg-indigo-100 px-2 py-1 rounded-md self-start">
              <Text className="text-[11px] font-poppins-semibold text-indigo-600">
                {item.text_status}
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Diterima</Text>
            <Text className="text-md font-poppins-semibold text-black">
              {item.tanggal_diterima}
            </Text>
          </View>

          <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Selesai</Text>
            <Text className="text-md font-poppins-semibold text-black">
              {item.tanggal_selesai || '-'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  </View>
);

const RekapData = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState('sampel-permohonan');
  const [reportUrl, setReportUrl] = useState('');
  const { setHeader } = useHeaderStore();

const [selectedStartDate, setSelectedStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
    const [selectedEndDate, setSelectedEndDate] = useState(moment().format('YYYY-MM-DD'));

  const [pdfError, setPdfError] = useState(false);
    const [pdfLoaded, setPdfLoaded] = useState(false);
  
    useEffect(() => {
      if (modalVisible) {
        setPdfLoaded(false);
        setPdfError(false);
      }
    }, [modalVisible]);

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

  const [isMandiri, setIsMandiri] = useState('-');
  const tipeMandiris = [
    { id: '-', title: 'Semua' },
    { id: '0', title: 'Diambil Petugas' },
    { id: '1', title: 'Dikirim Mandiri' },
  ];

  const [golonganId, setGolonganId] = useState('-');
  const golongans = [
    { id: '-', title: 'Semua' },
    { id: '1', title: 'Customer' },
    { id: '2', title: 'Dinas Internal' },
  ];

  React.useLayoutEffect(() => {
    setHeader(false);
    return () => setHeader(true);
  }, []);

  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedStartDate, selectedEndDate, isMandiri, golonganId, mode]);

  const handlePreviewPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      setReportUrl(`${APP_URL}/api/v1/report/rekap?token=${authToken}&start=${selectedStartDate}&end=${selectedEndDate}&is_mandiri=${isMandiri}&golongan_id=${golonganId}&mode=${mode}`);
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

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const fileName = `RekapParameter_${Date.now()}.pdf`;
      const downloadPath = Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadUrl = `${APP_URL}/report/rekap?start=${selectedStartDate}&end=${selectedEndDate}&is_mandiri=${isMandiri}&golongan_id=${golonganId}&mode=${mode}`;

      const options = {
        fromUrl: downloadUrl,
        toFile: downloadPath,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      setIsDownloading(true);
      const result = await RNFS.downloadFile(options).promise;
      setIsDownloading(false);

      if (result.statusCode === 200) {
        if (Platform.OS === 'android') {
          await RNFS.scanFile(downloadPath);
        }
        try {
          await FileViewer.open(downloadPath, {
            showOpenWithDialog: false,
            mimeType: 'application/pdf'
          });
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: `PDF Berhasil Diunduh. ${Platform.OS === 'ios' ? 'File tersimpan di Files app.' : `File tersimpan sebagai ${fileName} di folder Downloads.`}`,
          });
        } catch (error) {
          console.error('Error opening file:', error);
          Toast.show({
            type: 'info',
            text1: 'Info',
            text2: `File tersimpan di: ${downloadPath}`,
          });
        }
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      setIsDownloading(false);
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const getTipeMandirisActions = () => {
    return tipeMandiris.map(option => ({
      id: option.id,
      title: option.title,
      state: option.id === isMandiri ? 'on' : 'off',
      image: Platform.select({
        ios: option.id === isMandiri ? 'checkmark' : '',
        android: null
      })
    }));
  };

  const getGolongansActions = () => {
    return golongans.map(option => ({
      id: option.id,
      title: option.title,
      state: option.id === golonganId ? 'on' : 'off',
      image: Platform.select({
        ios: option.id === golonganId ? 'checkmark' : '',
        android: null
      })
    }));
  };

  const windowWidth = Dimensions.get('window').width;
  const dayWidth = (windowWidth - 80) / 7; // 80 is total horizontal padding/margins

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
      backgroundColor: '#e0e7ff', // Lighter indigo background
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
    dateNumberStyle: {
      color: '#1f2937',
      fontFamily: 'Poppins-Regular',
      fontSize: 14,
      textAlign: 'center',
    },
    disabledDateNameStyle: {
      color: '#d1d5db',
    },
    disabledDateNumberStyle: {
      color: '#d1d5db',
    },
    dayShape: {
      width: dayWidth - 8,
      height: dayWidth - 8,
      borderRadius: (dayWidth - 8) / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

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
          <Text className="text-[20px] font-poppins-medium text-black ml-4">Rekap Data</Text>
        </View>
        <View className="bg-fuchsia-600 rounded-full">
          <Ionicons
            name="reader"
            size={18}
            color={'white'}
            style={{ padding: 5 }}
          />
        </View>
      </View>

      <View className="p-4">
        <TouchableOpacity
          onPress={() => setShowCalendar(true)}
          className="mb-4 bg-white p-3 rounded-lg">
          <Text className="text-center text-black font-poppins-semibold">
            {`${selectedStartDate} to ${selectedEndDate}`}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-[11px] font-poppins-bold text-black mb-1 text-center">Tipe Pengambilan/Pengiriman</Text>
            <MenuView
              title="Tipe Pengambilan/Pengiriman"
              onPressAction={({ nativeEvent }) => {
                setIsMandiri(nativeEvent.event);
              }}
              actions={getTipeMandirisActions()}
              shouldOpenOnLongPress={false}
            >
              <View>
                <View className="flex-row items-center bg-white p-3 rounded-lg border border-gray-300">
                  <Text className="flex-1 text-center font-poppins-semibold text-black">
                    {tipeMandiris.find(t => t.id === isMandiri)?.title || 'Pilih Tipe'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                </View>
              </View>
            </MenuView>
          </View>

          <View className="flex-1 ml-2">
            <Text className="text-[11px] font-poppins-bold text-black mb-1 text-center">Tipe User</Text>
            <MenuView
              title="Tipe User"
              onPressAction={({ nativeEvent }) => {
                setGolonganId(nativeEvent.event);
              }}
              actions={getGolongansActions()}
              shouldOpenOnLongPress={false}
            >
              <View>
                <View className="flex-row items-center bg-white p-3 rounded-lg border border-gray-300">
                  <Text className="flex-1 text-center font-poppins-semibold text-black">
                    {golongans.find(g => g.id === golonganId)?.title || 'Pilih User'}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                </View>
              </View>
            </MenuView>
          </View>
        </View>

        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 p-3 rounded-t-lg ${mode === 'sampel-permohonan' ? 'bg-white border-t-2 border-indigo-900' : 'bg-gray-100'}`}
            onPress={() => setMode('sampel-permohonan')}>
            <Text className={`text-center font-poppins-semibold ${mode === 'sampel-permohonan' ? 'text-indigo-900' : 'text-gray-600'}`}>
              Sampel Permohonan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-3 rounded-t-lg ${mode === 'total-biaya' ? 'bg-white border-t-2 border-indigo-900' : 'bg-gray-100'}`}
            onPress={() => setMode('total-biaya')}>
            <Text className={`text-center font-poppins-semibold ${mode === 'total-biaya' ? 'text-indigo-900' : 'text-gray-600'}`}>
              Total Biaya
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/report/rekap"
          payload={{
            start: selectedStartDate,
            end: selectedEndDate,
            is_mandiri: isMandiri,
            golongan_id: golonganId,
            mode: mode
          }}
          renderItem={CardItem}
          className="mb-8"
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
        <View className="flex-row items-center">
          <FontAwesome5Icon name="file-pdf" size={22} color="#fff" />
        </View>
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
              todayTextStyle={{ color: '#312e81'}} 
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
              customDayHeaderStyles={{
                textStyle: {
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  color: '#6b7280',
                  textAlign: 'center',
                }
              }}
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
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor : "#ececec"  }}>
                <ActivityIndicator size="large" color="#312e81" style={{ top:180 }} />
                <Text className="mt-2 text-black font-poppins-medium" style={{ top:175 }}>Memuat PDF...</Text>
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
    </View>
  );
};

export default RekapData;