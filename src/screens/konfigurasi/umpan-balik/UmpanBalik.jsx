import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert, ActivityIndicator, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, PermissionsAndroid } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import HorizontalFilterMenu from '../../components/HorizontalFilterMenu';
import Paginate from '@/src/screens/components/Paginate';
import Toast from "react-native-toast-message";
import BackButton from '../../components/BackButton';
import { TextFooter } from '../../components/TextFooter';
import RNFS from 'react-native-fs';
import { APP_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';
import DocumentPicker from 'react-native-document-picker';
import { useHeaderStore } from '@/src/screens/main/Index';

const Options = [
  { id: 0, name: "Data Umpan Balik" },
  { id: 1, name: "Tabel Umpan Balik" },
];

const UmpanBalik = ({ navigation }) => {
  const [UmpanBalik, setUmpanBalik] = useState(null);
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [selectedMenu, setSelectedMenu] = useState(0);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [chartData, setChartData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const [formData, setFormData] = useState({
    uuid: '',
    kode: '',
    keterangan: ''
  });

  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  const monthOptions = [
    { id: 1, title: "Januari" },
    { id: 2, title: "Februari" },
    { id: 3, title: "Maret" },
    { id: 4, title: "April" },
    { id: 5, title: "Mei" },
    { id: 6, title: "Juni" },
    { id: 7, title: "Juli" },
    { id: 8, title: "Agustus" },
    { id: 9, title: "September" },
    { id: 10, title: "Oktober" },
    { id: 11, title: "November" },
    { id: 12, title: "Desember" },
  ];

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery(
    ['umpanBalikSummary', selectedYear, selectedMonth],
    async () => {
      try {
        console.log('Sending params:', { tahun: selectedYear, bulan: selectedMonth });

        // Kirim data menggunakan object biasa atau URLSearchParams
        // Opsi 1: Menggunakan object
        const response = await axios.post('/konfigurasi/umpan-balik/summary', {
          tahun: selectedYear,
          bulan: parseInt(selectedMonth)
        });

        console.log('API Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error detail:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        Alert.alert('Error', 'Gagal mengambil data summary');
        throw error;
      }
    },
    {
      enabled: selectedMenu === 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
      onSuccess: (data) => console.log('Query success:', data),
      onError: (error) => console.log('Query error:', error)
    }
  );


  const handleYearChange = (event) => {
    const newYear = event.nativeEvent.event;
    console.log('Year changed to:', newYear);
    setSelectedYear(newYear);
    queryClient.invalidateQueries(['umpanBalikSummary']);
  };

  const handleMonthChange = (event) => {
    const newMonth = event.nativeEvent.event;
    console.log('Month changed to:', newMonth);
    setSelectedMonth(newMonth);
    queryClient.invalidateQueries(['umpanBalikSummary']);
  };

  const handleResetConfirmation = () => {
    setResetModalVisible(true);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      const response = await axios.post('/konfigurasi/umpan-balik/reset', {
        tahun: selectedYear,
        bulan: parseInt(selectedMonth)
      });

      setResetModalVisible(false);

      queryClient.invalidateQueries(['umpanBalikSummary']);

      Toast.show({
        type: 'success',
        text1: 'Sukses',
        text2: 'Data berhasil direset',
      });
    } catch (error) {
      console.error('Reset Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Gagal mereset data. Silakan coba lagi.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
      });

      setSelectedFile(result[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Gagal memilih file',
        });
      }
    }
  };

  // Add import function
  const handleImport = async () => {
    if (!selectedFile) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'File tidak boleh kosong',
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('tahun', selectedYear);
      formData.append('bulan', parseInt(selectedMonth));
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });

      const response = await axios.post('/konfigurasi/umpan-balik/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportModalVisible(false);
      setSelectedFile(null);
      queryClient.invalidateQueries(['umpanBalikSummary']);

      Toast.show({
        type: 'success',
        text1: 'Sukses',
        text2: 'Data berhasil diimport',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Gagal mengimport data',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveForm = async () => {
    setLoading(true);

    try {
      if (!formData.keterangan || formData.keterangan.trim() === '') {
        Alert.alert('Error', 'Keterangan tidak boleh kosong');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('kode', formData.kode);
      params.append('keterangan', formData.keterangan.trim());

      const response = await axios.post(
        `/konfigurasi/umpan-balik/keterangan/${formData.uuid}/update`,
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data.status == 'success') {
        // Reset form data first
        setFormData({
          uuid: '',
          kode: '',
          keterangan: ''
        });

        // Refresh data
        if (paginateRef.current) {
          paginateRef.current.refetch();
        }

        setLoading(false);
        setModalVisible(false);

        Toast.show({
          type: 'success',
          text1: 'Sukses',
          text2: 'Data berhasil disimpan',
        })
      }
    } catch (error) {
      setLoading(false);
      setModalVisible(false);
      console.error('Save Error:', error.response.data.message);
      // Alert.alert(
      //   'Error',
      //   error.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.'
      // );
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.',
      })
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

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
      console.error('Permission error:', err);
      return false;
    }
  };

  const [authToken, setAuthToken] = useState('');
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('@auth-token');
      setAuthToken(token)
    })()
  })

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('konfigurasi/umpan-balik/template', {
        headers: {
          Authorization: `Bearer ${authToken}`, // Menambahkan Authorization header
        },
        responseType: 'arraybuffer', // Konfigurasi respons biner
      });

      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'Template Import Umpan Balik.xlsx'; // Nama default jika tidak ada header

      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="(.+?)"/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      // Tentukan path untuk menyimpan file
      const path = Platform.OS === "ios" ? `${RNFS.DocumentDirectoryPath}/${fileName}` : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Konversi buffer ke string ASCII untuk menyimpan file
      const buffer = new Uint8Array(response.data);
      const fileContent = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');

      // Menyimpan file ke perangkat lokal
      await RNFS.writeFile(path, fileContent, 'ascii');

      console.log('File berhasil diunduh dan disimpan di:', path);

      Toast.show({
        type: 'success',
        text1: 'Berhasil!',
        text2: 'File berhasil diunduh',
      })
    } catch (error) {
      console.error('Error saat mengunduh file:', error);
    }
  }

  const renderDownloadConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={downloadModalVisible}
      onRequestClose={() => setDownloadModalVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
          <View className="w-20 h-20 rounded-full bg-green-100 justify-center items-center mb-4">
            <FontAwesome5 size={40} color="#177a44" name="file-excel" />
          </View>

          <Text className="text-xl font-poppins-semibold text-black mb-3">
            Konfirmasi Download
          </Text>

          <View className="w-full h-px bg-gray-200 mb-4" />

          <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
            Apakah Anda yakin ingin Mengunduh Report Berformat Excel?
          </Text>

          <View className="flex-row w-full justify-between">
            <TouchableOpacity
              onPress={() => {
                downloadTemplate();
                setDownloadModalVisible(false);
              }}
              className="flex-1 mr-2 bg-green-500 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-poppins-medium">Ya, Download</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDownloadModalVisible(false)}
              className="flex-1 ml-3 bg-gray-100 py-3 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-poppins-medium">Batal</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );

  const closeModal = () => {
    setFormData({
      uuid: '',
      kode: '',
      keterangan: ''
    });
    setModalVisible(false);
  };


  const renderResetConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={resetModalVisible}
      onRequestClose={() => setResetModalVisible(false)}
    >
      <View
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        className="flex-1 justify-center items-center"
      >
        <View className="bg-white rounded-lg w-[90%] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-poppins-medium text-black">Konfirmasi Reset</Text>
            <TouchableOpacity onPress={() => setResetModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-base font-poppins-regular text-black text-center">
              Apakah Anda yakin ingin mereset data tersebut?
            </Text>
          </View>

          <View className="flex-row justify-center gap-3">
            <TouchableOpacity
              onPress={() => setResetModalVisible(false)}
              className="px-6 py-2 bg-gray-400 rounded-lg"
            >
              <Text className="text-white font-poppins-medium">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResetData}
              disabled={isResetting}
              className="px-6 py-2 bg-red-500 rounded-lg"
            >
              {isResetting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-poppins-medium">Ya, Reset</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderImportModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={importModalVisible}
      onRequestClose={() => setImportModalVisible(false)}
    >
      <View
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        className="flex-1 justify-center items-center"
      >
        <View className="bg-white rounded-lg w-[90%] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-poppins-medium text-black">Import Data Umpan Balik</Text>
            <TouchableOpacity onPress={() => {
              setImportModalVisible(false);
              setSelectedFile(null);
            }}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text className="text-base font-poppins-medium text-black mb-2">File Excel</Text>
            <TouchableOpacity
              onPress={pickFile}
              className="border border-gray-300 rounded-lg p-4 bg-gray-50"
            >
              <Text className="text-gray-600 font-poppins-regular">
                {selectedFile ? selectedFile.name : 'Pilih file excel'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-end gap-3">
            <TouchableOpacity
              onPress={() => {
                setImportModalVisible(false);
                setSelectedFile(null);
              }}
              className="px-6 py-2 bg-gray-400 rounded-lg"
            >
              <Text className="text-white font-poppins-medium">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImport}
              disabled={isImporting || !selectedFile}
              className={`px-6 py-2 rounded-lg ${isImporting || !selectedFile ? 'bg-red-300' : 'bg-red-500'}`}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-poppins-medium">Import</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderStats = (data) => {
    if (!data?.data) return null;

    return (
      <View className="mx-4">
        <View className="bg-[#F9F9F9] rounded-lg flex-1 overflow-hidden shadow-sm"
          style={{
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            borderRightWidth: 1,
            borderRightColor: '#e5e7eb',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            borderLeftWidth: 4,
            borderLeftColor: '#0090a6',
          }}>
          <View className="flex-row justify-content-center items-center">
            <View className=" ml-5 ">
              <IonIcons name="ribbon" size={30} color="#0090a6" />
            </View>
            <View className="p-4 ml-4">
              <Text className="text-[20px] font-poppins-bold text-[#0090a6]">
                {data.ikm?.toFixed(2)}
              </Text>
              <Text className="text-black font-poppins-regular">
                IKM Unit Pelayanan
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-[#F9F9F9] rounded-lg flex-1 overflow-hidden shadow-sm mt-2"
          style={{
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            borderRightWidth: 1,
            borderRightColor: '#e5e7eb',
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            borderLeftWidth: 4,
            borderLeftColor: '#0090a6',
          }}>

          <View className="flex-row justify-content-center items-center">
            <View className="ml-5">
              <MaterialCommunityIcons name="clipboard-text" size={30} color="#0090a6" />
            </View>
            <View className="p-4 ml-4">
              <Text className="text-[20px] font-poppins-bold text-[#0090a6]">
                {data.data?.jumlah}
              </Text>
              <Text className="text-black font-poppins-regular">
                Jumlah Responden
              </Text>
            </View>
          </View>
        </View>
      </View>

    );
  };

  const renderChart = (data) => {
    if (!data?.data) return null;
    const chartData = {
      labels: ['U1', 'U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9'],
      datasets: [{
        data: [
          parseFloat(data.data?.u1) || 0,
          parseFloat(data.data?.u2) || 0,
          parseFloat(data.data?.u3) || 0,
          parseFloat(data.data?.u4) || 0,
          parseFloat(data.data?.u5) || 0,
          parseFloat(data.data?.u6) || 0,
          parseFloat(data.data?.u7) || 0,
          parseFloat(data.data?.u8) || 0,
          parseFloat(data.data?.u9) || 0,
        ]
      }]
    };

    return (
      <View>
        <View className="mt-4 bg-white rounded-lg" style={{ marginLeft: -15 }}>
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 60}
            height={250}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(49, 46, 129, ${opacity})`,
              barPercentage: 0.7,
              style: {
                borderRadius: 16
              },
              propsForLabels: {
                fontSize: 12,
              },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: '#e3e3e3',
              }
            }}
            style={{
              marginVertical: 15,
              borderRadius: 5,
            }}
            showValuesOnTopOfBars={false}
            fromZero={false}
          />
        </View>
      </View>
    );
  };
  const renderCardTemplate = () => (
    <TouchableOpacity
      onPress={() => setDownloadModalVisible(true)}
      style={{
        position: 'absolute',
        bottom: 25,
        right: 20,
        backgroundColor: '#177a44',
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

      <FontAwesome5
        name="file-excel"
        size={20}
        color="#fff"
      />
    </TouchableOpacity>
  );
  const renderPaginateItem = ({ item }) => (
    <View className="bg-[#f8f8f8] rounded-md border-t-[6px] border-indigo-900 p-5 mb-4" style={{ elevation: 4 }}>
      <View cla>
        <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
        <Text className="text-md font-poppins-semibold mb-5 text-black" style={{ textTransform: 'uppercase' }}>{item.kode}</Text>

        <Text className="text-xs font-poppins-regular text-gray-500">Keterangan</Text>
        <Text className="text-md mb-3 font-poppins-medium text-black">{item.keterangan}</Text>

        <View className="h-[1px] bg-gray-300 my-3" />
        <View className="flex items-end">
          <TouchableOpacity
            onPress={() => {
              setFormData({ uuid: item.uuid, kode: item.kode, keterangan: item.keterangan });
              setModalVisible(true);
            }}
            className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
          >
            <IonIcons name="pencil" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="flex-1 justify-center items-center"
        >
          <View className="bg-white rounded-lg w-[90%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-poppins-semibold text-black">Edit Keterangan Umpan Balik</Text>
              <TouchableOpacity onPress={closeModal}>
                <MaterialIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-100 mb-4 font-poppins-bold text-gray-500"
              value={formData.kode}
              editable={false}
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-6 font-poppins-regular"
              value={formData.keterangan}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, keterangan: text }))}
              multiline
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={closeModal} className="px-4 py-2 bg-gray-400 rounded-lg">
                <Text className="text-white font-poppins-medium">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveForm}
                className="px-4 py-2 bg-[#312e81] rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white font-poppins-medium">Simpan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );


  const renderChartContent = () => {
    return (
      <ScrollView className="flex-1">
        <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
          <View>
            <View className="flex-row justify-end space-x-2">
              <MenuView
                title="Pilih Tahun"
                onPressAction={handleYearChange}
                actions={generateYears().map(option => ({
                  id: option.id.toString(),
                  title: option.title,
                }))}>
                <View>
                  <View className="flex-row items-center bg-[#f9f9f9] px-2 py-2 rounded-lg border border-gray-300 w-[100px]">
                    <Text className="flex-1 text-center text-black font-poppins-medium">
                      {`${selectedYear}`}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                  </View>
                </View>
              </MenuView>

              <MenuView
                title="Pilih Bulan"
                onPressAction={handleMonthChange}
                actions={monthOptions.map(option => ({
                  id: option.id.toString(),
                  title: option.title,
                }))}>
                <View>
                  <View className="flex-row items-center bg-[#f9f9f9] px-2 py-2 rounded-lg border border-gray-300 w-[150px]">
                    <Text className="flex-1 text-center text-black font-poppins-medium">
                      {`${monthOptions.find(m => m.id.toString() === selectedMonth)?.title || 'Pilih'}`}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                  </View>
                </View>
              </MenuView>
            </View>

            <View className="border-b border-gray-200 my-4" />

            <View className="flex-row justify-center space-x-2 mb-4">
              <TouchableOpacity
                onPress={handleResetConfirmation}
                className="flex-row items-center bg-amber-100 px-6 py-2 rounded-lg"
              >
                <AntDesign name="sync" size={20} color="#fbbf24" />
                <Text className="ml-2 text-amber-400 font-poppins-medium">Reset Data</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setImportModalVisible(true)}
                className="flex-row items-center bg-red-100 px-6 py-2 rounded-lg"
              >
                <FontIcon name="file-upload" size={20} color="#ef4444" />
                <Text className="ml-2 text-red-500 font-poppins-medium">Import Data</Text>
              </TouchableOpacity>
            </View>

            {isSummaryLoading ? (
              <View className="flex items-center justify-center p-4">
                <ActivityIndicator size="large" color="#312e81" />
              </View>
            ) : (
              <>
                <View className="mb-4">
                  {renderStats(summaryData)}
                </View>
                {renderChart(summaryData)}
              </>
            )}
          </View>
        </View>
        <View className="mt-12 mb-8">
          <TextFooter />
        </View>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (selectedMenu === 0) {
      return renderChartContent();
    }

    return (
      <View className="flex-1 mt-2">
        {renderCardTemplate()}
        <ScrollView>
          <Paginate
            ref={paginateRef}
            url="/konfigurasi/umpan-balik/keterangan"
            renderItem={renderPaginateItem}
            className=""
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-gray-500">Tidak ada data</Text>
              </View>
            )}
            refreshing={false}
            onRefresh={() => {
              if (paginateRef.current) {
                paginateRef.current.refresh();
              }
            }}
          />
          <View className="mt-12 mb-8">
            <TextFooter />
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#ececec]">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <IonIcons name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
          <Text className="text-[20px] font-poppins-medium text-black ml-3">Umpan Balik</Text>
        </View>
        <View className="bg-green-600 rounded-full">
          <IonIcons name="chatbubble-ellipses" size={18} color={'white'} style={{ padding: 5 }} />
        </View>
      </View>
      <View className="flex-1">
        <View className="flex-row justify-center mt-4 ml-10">
          <HorizontalFilterMenu
            items={Options}
            selected={selectedMenu}
            onPress={(item) => setSelectedMenu(item.id)}
          />
        </View>

        {renderContent()}
        {renderModal()}
        {renderDownloadConfirmationModal()}
        {renderResetConfirmationModal()}
        {renderImportModal()}

      </View>

    </SafeAreaView>

  );
};

export default UmpanBalik;