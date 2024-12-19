import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, Modal, ScrollView } from 'react-native';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Paginate from "@/src/screens/components/Paginate";
import { APP_URL } from "@env";
import BackButton from "@/src/screens/components/BackButton";
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

const RekapData = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('start');
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState('sampel-permohonan');
  const [reportUrl, setReportUrl] = useState('');
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const [selectedDate, setSelectedDate] = useState({
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD')
  });

  const [isMandiri, setIsMandiri] = useState(false);
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

  // Effect untuk me-refresh data ketika filter berubah
  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedDate.start, selectedDate.end, isMandiri, golonganId, mode]);

  const handleDateSelection = (type) => {
    setDateType(type);
    setShowDatePicker(true);
  };

  const handleDateConfirm = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    setSelectedDate(prev => ({
      ...prev,
      [dateType]: formattedDate
    }));
    setShowDatePicker(false);

    if (dateType === 'start') {
      setTimeout(() => {
        setDateType('end');
        setShowDatePicker(true);
      }, 500);
    }
  };

  const handlePreviewPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      // Preview URL menggunakan full path dengan /api/v1 dan membutuhkan token
      setReportUrl(`${APP_URL}/api/v1/report/rekap?token=${authToken}&start=${selectedDate.start}&end=${selectedDate.end}&is_mandiri=${isMandiri}&golongan_id=${golonganId}&mode=${mode}`);
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

      // Download URL menggunakan path yang lebih pendek tanpa /api/v1
      const downloadUrl = `${APP_URL}/report/rekap?start=${selectedDate.start}&end=${selectedDate.end}&is_mandiri=${isMandiri}&golongan_id=${golonganId}&mode=${mode}`;

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
          text2: `PDF Berhasil Diunduh. ${Platform.OS === 'ios' ? 'File tersimpan di Files app.' : `File tersimpan sebagai ${fileName} di folder Downloads.`}`,
        });
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
          onPress={() => handleDateSelection('start')}
          className="mb-4 bg-white p-3 rounded-lg ">
          <Text className="text-center text-black font-poppins-semibold">
            {`${selectedDate.start} to ${selectedDate.end}`}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-4">
          <View className="flex-1 mr-2">
            <Text className="text-[11px] font-poppins-bold text-black mb-1 text-center" >Tipe Pengambilan/Pengiriman</Text>
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
            <Text className="text-[11px] font-poppins-bold text-black mb-1 text-center" >Tipe User</Text>
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
            start: selectedDate.start,
            end: selectedDate.end,
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

        <View className="flex-row items-center">
          <FontAwesome5Icon name="file-pdf" size={22} color="#fff" />
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        date={new Date(dateType === 'start' ? selectedDate.start : selectedDate.end)}
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

    </View>
  );
};

export default RekapData;