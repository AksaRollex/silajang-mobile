import React, { useState, useRef } from 'react';
import { 
  View, 
  Text,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { LineChart } from 'react-native-chart-kit';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import Paginate from '@/src/screens/components/Paginate';

const Options = [
  { id: 0, name: "Umpan Balik Chart" },
  { id: 1, name: "Umpan Balik Paginate" },
];

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

const UmpanBalik = () => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [selectedMenu, setSelectedMenu] = useState(0);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    uuid: '',
    kode: '',
    keterangan: ''
  });
  const [loading, setLoading] = useState(false);
  

 
  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery(
    ['umpanBalikSummary', selectedYear, selectedMonth],
    async () => {
      const formData = new FormData();
      formData.append('tahun', selectedYear);
      formData.append('bulan', parseInt(selectedMonth));

      const response = await axios.post('/konfigurasi/umpan-balik/summary', formData);
      return response.data;
    },
    {
      enabled: selectedMenu === 0,
      onError: (error) => {
        console.error('Error fetching summary data:', error);
        Alert.alert('Error', 'Gagal mengambil data summary');
      }
    }
  );

  const handleYearChange = (event) => {
    setSelectedYear(event.nativeEvent.event);
    queryClient.invalidateQueries(['umpanBalikSummary']);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.nativeEvent.event);
    queryClient.invalidateQueries(['umpanBalikSummary']);
  };


  const handleSaveForm = async () => {
    setLoading(true);
    try {
      if (!formData.keterangan || formData.keterangan.trim() === '') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Keterangan tidak boleh kosong',
          position: 'bottom',
          visibilityTime: 2000,
        });
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
  
      if (response.data.success) {
        // Invalidate and refetch queries
        await queryClient.invalidateQueries(['umpanBalikSummary']);
        
        // Reset form data
        setFormData({
          uuid: '',
          kode: '',
          keterangan: ''
        });
        
        // Close modal first
        setModalVisible(false);

        // Refresh paginate component
        if (paginateRef.current) {
          paginateRef.current.refresh();
        }

        // Show success toast after modal is closed
        setTimeout(() => {
          Toast.show({
            type: 'success',
            text1: 'Sukses',
            text2: 'Data berhasil disimpan',
            position: 'bottom',
            visibilityTime: 2000,
          });
        }, 100);
      }
    } catch (error) {
      console.error('Save Error:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Gagal menyimpan data. Silakan coba lagi.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };


  const renderStats = (data) => {
    if (!data?.data) return null;
    
    return (
      <View className="flex-row justify-between mt-4 mx-2 gap-4">
        <View className="bg-white rounded-lg flex-1 overflow-hidden shadow-sm" 
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2596be',
          }}>
          <View className="p-4">
            <View className="mb-3">
              <FontAwesome5Icon name="medal" size={24} color="#2596be" />
            </View>
            <Text className="text-[40px] font-bold text-[#2596be]">
              {data.ikm?.toFixed(2)}
            </Text>
            <Text className="text-gray-400 text-base mt-1">
              IKM Unit Pelayanan
            </Text>
          </View>
        </View>
  
        <View className="bg-white rounded-lg flex-1 overflow-hidden shadow-sm"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2596be',
          }}>
          <View className="p-4">
            <View className="mb-3">
              <MaterialCommunityIcons name="clipboard-text" size={24} color="#2596be" />
            </View>
            <Text className="text-[40px] font-bold text-[#2596be]">
              {data.data?.jumlah}
            </Text>
            <Text className="text-gray-400 text-base mt-1">
              Jumlah Responden
            </Text>
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
      <View className="mt-4 bg-white p-4 rounded-lg">
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(49, 46, 129, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </View>
    );
  };
  const renderPaginateItem = ({ item }) => (
    <View className="bg-[#f8f8f8] rounded-md border-t-[6px] border-indigo-900 p-5 mb-4" style={{ elevation: 4 }}>
      <View className="flex-row justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-[18px] font-extrabold mb-5">{item.kode}</Text>
          <Text className="text-[14px] mb-3">{item.keterangan}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            setFormData({ uuid: item.uuid, kode: item.kode, keterangan: item.keterangan });
            setModalVisible(true);
          }}
          className="h-8 w-8 bg-blue-600 rounded-full items-center justify-center mt-5"
        >
          <MaterialIcons name="edit" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          className="flex-1 justify-center items-center">
          <View className="bg-white rounded-lg w-[90%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-bold">Edit Keterangan Umpan Balik</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-100 mb-4"
              value={formData.kode}
              editable={false}
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-6"
              value={formData.keterangan}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, keterangan: text }))}
              multiline
            />
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2 bg-gray-400 rounded-lg">
                <Text className="text-white">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveForm} 
                className="px-4 py-2 bg-[#312e81] rounded-lg" 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-white">Simpan</Text>
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
        <View className="flex-row justify-end space-x-3 mt-4 mb-5">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <View className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-300 w-[185px]">
                <Text className="flex-1 text-center text-black">
                  {`Tahun: ${selectedYear}`}
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
              <View className="flex-row items-center bg-white px-3 py-2 rounded-lg border border-gray-300 w-[185px]">
                <Text className="flex-1 text-center text-black">
                  {`Bulan: ${monthOptions.find(m => m.id.toString() === selectedMonth)?.title || 'Pilih'}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>
        </View>

        {isSummaryLoading ? (
          <View className="flex items-center justify-center p-4">
            <ActivityIndicator size="large" color="#312e81" />
          </View>
        ) : (
          <>
            {renderStats(summaryData)}
            {renderChart(summaryData)}
          </>
        )}
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (selectedMenu === 0) {
      return renderChartContent();
    }

    return (
      <View className="flex-1 mt-2">
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
      <View className="flex-1">
        <View className="flex-row justify-center">
          <View className="mt-3 ml-[-10] mr-2"> 
          <HorizontalScrollMenu
              items={Options}
              selected={selectedMenu}
              onPress={(item) => setSelectedMenu(item.id)}
              itemWidth={170}
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
                      fontSize: 14,
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
      </View>
      <Toast/>
    </SafeAreaView>
  );
};

export default UmpanBalik;