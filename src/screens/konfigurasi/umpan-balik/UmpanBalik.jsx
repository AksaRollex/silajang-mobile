import React, {  useEffect, useState, useRef } from 'react';
import {  View,  Text, Alert, ActivityIndicator, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcons from 'react-native-vector-icons/Ionicons';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import Paginate from '@/src/screens/components/Paginate';
import Toast from "react-native-toast-message";
import BackButton from '../../components/BackButton';
import { TextFooter } from '../../components/TextFooter';
import RNFS from 'react-native-fs';
import { APP_URL } from "@env";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';

const Options = [
  { id: 0, name: "Data Umpan Balik" },
  { id: 1, name: "Tabel Umpan Balik" },
];

const UmpanBalik = ({navigation}) => {
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
  const [loading, setLoading] = useState(false);
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

        // Atau Opsi 2: Menggunakan URLSearchParams
        /*
        const params = new URLSearchParams();
        params.append('tahun', selectedYear);
        params.append('bulan', parseInt(selectedMonth));

        const response = await axios.post('/konfigurasi/umpan-balik/summary', 
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        */
        
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

    const downloadTemplate = async () => {
    try {
      const localFile = `${RNFS.DownloadDirectoryPath}/Template Import Umpan Balik.xlsx`;
      const authToken = await AsyncStorage.getItem('@auth_token');

      const options = {
        fromUrl: `${APP_URL}/konfigurasi/umpan-balik/template`,
        toFile: localFile,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      };

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        const fileExists = await RNFS.exists(localFile);
        if (fileExists) {
          Toast.show({
            type: 'success',
            text1: 'Sukses',
            text2: 'File berhasil diunduh',
          });
        } else {
          throw new Error('Failed to download template');
        }
      } else {
        throw new Error(`Failed to download template ${response.statusCode}`);
      }
    } catch (error) {
      console.error('Download Error:', error);

      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal mengunduh template. Silakan coba lagi.',
      });
    } finally {
      setDownloadModalVisible(false);
    }
  }

  const renderDownloadConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={downloadModalVisible}
      onRequestClose={() => setDownloadModalVisible(false)}
    >
      <View
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        className="flex-1 justify-center items-center"
      >
        <View className="bg-white rounded-lg w-[90%] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-lg font-poppins-medium text-black">Konfirmasi Download</Text>
            <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          
          <View className="mb-6">
            <Text className="text-base font-poppins-regular text-black text-center">
              Apakah Anda yakin ingin Mengunduh Report Berformat Excel?
            </Text>
          </View>

          <View className="flex-row justify-center gap-3">
            <TouchableOpacity 
              onPress={() => setDownloadModalVisible(false)} 
              className="px-6 py-2 bg-gray-400 rounded-lg"
            >
              <Text className="text-white font-poppins-medium">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={downloadTemplate}
              className="px-6 py-2 bg-green-500 rounded-lg"
            >
              <Text className="text-white font-poppins-medium">Download</Text>
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

  const renderStats = (data) => {
    if (!data?.data) return null;
    
    return (
      <View className="mx-4">
        <View className="bg-[#F9F9F9] rounded-lg flex-1 overflow-hidden shadow-sm" 
          style={{
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
                <Text className="text-gray-400 font-poppins-regular">
                  IKM Unit Pelayanan
                </Text>
              </View>
          </View>
        </View>
  
        <View className="bg-[#F9F9F9] rounded-lg flex-1 overflow-hidden shadow-sm mt-2"
          style={{
            borderLeftWidth: 5,
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
              <Text className="text-gray-400 font-poppins-regular">
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
        <View className="mt-4 bg-white rounded-lg" style={{ marginLeft: -15}}>
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 65}
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
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        borderRadius: 24,
        overflow: 'hidden'
      }}
    >
      <View className="bg-[#217346]  rounded-xl mx-4 mt-3 p-3 flex-row justify-center items-center space-x-2 elevation-4 border-2 border-gray-200">
        <Text className="text-white text-sm font-poppins-medium text-center">
          Download Template Import
        </Text>
    
        <MaterialCommunityIcons 
          name="file-excel-outline" 
          size={20} 
          color="white" 
        />
      </View>
    </TouchableOpacity>
  );

  const renderPaginateItem = ({ item }) => (
    <View className="bg-[#f8f8f8] rounded-md border-t-[6px] border-indigo-900 p-5 mb-4" style={{ elevation: 4 }}>
      <View className="flex-row justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-[18px] font-poppins-semibold mb-5 text-black" style={{ textTransform: 'uppercase' }}>{item.kode}</Text>
          <Text className="text-[14px] mb-3 font-poppins-medium text-black">{item.keterangan}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setFormData({ uuid: item.uuid, kode: item.kode, keterangan: item.keterangan });
            setModalVisible(true);
          }}
          className="h-7 w-7 bg-[#f8f8f8] rounded-md items-center justify-center mt-5"
        >
          <MaterialCommunityIcons name="pencil-box-outline" size={25} color="#312e81" />
        </TouchableOpacity>
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
                    <MaterialIcons name="arrow-drop-down" size={24} color="black"/>
                  </View>
                </View>
              </MenuView>
            </View>
            
            {/* Border separator */}
            <View className="border-b border-gray-200 my-4" />
  
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
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#ececec]">
      <View className="flex-row items-center justify-center mt-4 mb-2">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Umpan Balik</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row justify-center">
          <View className="mt-3 ml-[-10] mr-2"> 
          <HorizontalScrollMenu
              textStyle={{ fontFamily: 'Poppins-Medium', fontSize: 12 }}
              items={Options}
              selected={selectedMenu}
              onPress={(item) => setSelectedMenu(item.id)}
              itemWidth={190}
                  scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                  activeBackgroundColor={"#312e81"}
                  buttonStyle={{ marginRight: 10, borderRadius: 20, backgroundColor: "white" }}
              itemRender={(item) => (
                <View
                  style={{
                    borderColor: '#312e81',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                    }}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {renderContent()}
        {renderModal()}
        {renderDownloadConfirmationModal()}
        
      </View>
      
    </SafeAreaView>

  );
};

export default UmpanBalik;