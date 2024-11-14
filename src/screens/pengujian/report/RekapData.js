import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from 'moment';
import RNFetchBlob from 'rn-fetch-blob';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Paginate from "@/src/screens/components/Paginate";
import { APP_URL } from "@env";
import BackButton from "@/src/screens/components/BackButton";
import Pdf from "react-native-pdf";

const RekapData = ({navigation}) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateType, setDateType] = useState('start'); 
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState('sampel-permohonan'); 
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

  const handleReport = async (mode) => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    
    if (isPreviewMode) {
      const url = `${APP_URL}/api/v1/report/rekap?token=${authToken}&start=${startDate}&end=${endDate}&is_mandiri=${isMandiri}&golongan_id=${golonganId}&mode=${mode}`;
      setReportUrl(url);
      setModalVisible(true);
    } else {
      try {
        const response = await fetch(
          `${APP_URL}/report/rekap?start=${startDate}&end=${endDate}&is_mandiri=${isMandiri}&golongan_id=${golonganId}&mode=${mode}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Download failed');
        }
  
        const blob = await response.blob();
        const filePath = `${RNFS.DocumentDirectoryPath}/report_${Date.now()}.pdf`;
        await RNFS.writeFile(filePath, blob, 'base64');
        
        Alert.alert('Success', 'Report downloaded successfully');
      } catch (error) {
        console.error('Download error:', error);
        Alert.alert('Error', 'Failed to download report');
      }
    }
  };

  const downloadPdf = async (url, params) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }

      const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      const fullUrl = `${APP_URL}${url}?${queryString}`;
      const timestamp = new Date().getTime();
      const filename = `report_${timestamp}.pdf`;

      const { dirs } = RNFetchBlob.fs;
      const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filePath = `${dirToSave}/${filename}`;

      const response = await RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading PDF Report',
          mime: 'application/pdf',
        },
        path: filePath
      }).fetch('GET', fullUrl, {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      });

      if (Platform.OS === 'ios') {
        RNFetchBlob.ios.openDocument(response.path());
      }

      return response.path();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
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
    <View className="mb-4 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
      <View className="flex-row items-center">
        <View style={{ width: "90%" }}>
          <View className="flex-col space-y-2">
            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Kode:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black">
                {item.kode}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Pelanggan:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black"
                numberOfLines={2}>
                {item.permohonan?.user?.nama}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Lokasi:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black"
                numberOfLines={2}>
                {item.lokasi}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Status:</Text>
              <View className="bg-indigo-100 px-2 py-1 rounded-md self-start">
                <Text className="text-[12px] font-poppins-semibold text-indigo-600">
                  {item.text_status}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Tanggal Diterima:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black">
                {item.tanggal_diterima}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Tanggal Selesai:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black">
                {item.tanggal_selesai || '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-gray-100 p-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-lg font-poppins-bold text-black ml-16 self-center">Rekap Data</Text>
          <TouchableOpacity
            onPress={handleReport}
            disabled={isDownloading}
            className={`flex-row space-x-2 ${
              isDownloading ? 'bg-gray-100' : 'bg-red-50'
            } px-4 py-2 rounded-md`}>
            {isDownloading ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <MaterialIcons name="file-download" size={20} color="#dc2626" />
            )}
            <Text className="text-red-600 font-poppins-semibold">
              {isDownloading ? 'Downloading...' : 'Cetak'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => handleDateSelection('start')}
          className="mb-4 bg-white p-3 rounded-lg border border-gray-300">
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
      />

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setShowDatePicker(false)}
        date={new Date(dateType === 'start' ? selectedDate.start : selectedDate.end)}
      />
    </View>
  );
};

export default RekapData;