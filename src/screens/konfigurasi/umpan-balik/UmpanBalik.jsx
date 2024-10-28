import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";

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
  const [page] = useState(1);
  const [itemsPerPage] = useState(5);

  // Generate years function
  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  // React Query for summary data
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
      onError: (error) => {
        console.error('Error fetching summary data:', error);
        Alert.alert('Error', 'Gagal mengambil data summary');
      }
    }
  );

  // React Query for table data
  const { data: tableData, isLoading: isTableLoading } = useQuery(
    ['umpanBalikTable', page, itemsPerPage],
    async () => {
      const params = {
        page: page,
        per_page: itemsPerPage
      };

      const response = await axios.get('/konfigurasi/umpan-balik/keterangan', { params });
      return response.data;
    },
    {
      enabled: selectedMenu === 1,
      onError: (error) => {
        console.error('Error fetching table data:', error);
        Alert.alert('Error', 'Gagal mengambil data tabel');
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

  const renderStats = (data) => {
    if (!data?.data) return null;
    
    return (
      <View className="flex-row justify-between mt-4">
        <View className="bg-white p-4 rounded-lg flex-1 mr-2">
          <Text className="text-gray-600 mb-1">IKM Unit Pelayanan</Text>
          <Text className="text-2xl font-bold text-blue-800">
            {data.ikm?.toFixed(2)}
          </Text>
        </View>
        <View className="bg-white p-4 rounded-lg flex-1 ml-2">
          <Text className="text-gray-600 mb-1">Jumlah Responden</Text>
          <Text className="text-2xl font-bold text-blue-800">
            {data.data?.jumlah}
          </Text>
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

  const renderTable = (data) => {
    return (
      <View className="mt-4">
        {data.map((item, index) => (
          <View key={item.uuid} className="bg-white p-4 rounded-lg mb-2">
            <Text className="font-bold">{item.kode.toUpperCase()}</Text>
            <Text className="text-gray-600">{item.keterangan}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <View className="flex-row justify-center">
          <View className="mt-3 ml-[-10] mr-2"> 
            <HorizontalScrollMenu
              items={Options}
              selected={selectedMenu}
              onPress={item => setSelectedMenu(item.id)}
              itemWidth={170}
              itemRender={(item, index) => (
                <View style={{
                  backgroundColor: selectedMenu === item.id ? '#312e81' : 'white',
                  borderRadius: 20,
                  padding: 8,
                  marginRight: 10,
                  width: 170,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    color: selectedMenu === item.id ? 'white' : '#312e81',
                    fontSize: 14,
                  }}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        {/* Filter Section */}
        <View className="flex-row justify-end space-x-3 mt-4">
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

        {/* Content Section */}
        {selectedMenu === 0 ? (
          <>
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
          </>
        ) : (
          <>
            {isTableLoading ? (
              <View className="flex items-center justify-center p-4">
                <ActivityIndicator size="large" color="#312e81" />
              </View>
            ) : (
              renderTable(tableData?.data || [])
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default UmpanBalik;