import axios from "@/src/libs/axios";
import { rupiah } from "@/src/libs/utils";
import { useUser } from "@/src/services";
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Dimensions, ActivityIndicator } from "react-native";
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, StackedBarChart } from "react-native-chart-kit";
import { TouchableOpacity } from "react-native-gesture-handler";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import Fontisto from "react-native-vector-icons/Fontisto";
import IonIcons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { TextFooter } from "../components/TextFooter";
import Paginate from "@/src/screens/components/Paginate";
import { MenuView } from "@react-native-menu/menu";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const requestTypes = [
    { label: "Permohonan Baru", value: "new" },
    { label: "Permohonan Proses", value: "process" },
    { label: "Permohonan Selesai", value: "completed" },
    { label: "Total Permohonan", value: "total" },
  ];
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahuns, setTahuns] = useState([]);
  const { data: user } = useUser();
  const navigation = useNavigation();
  const paginateRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const [chartData, setChartData] = useState(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [chartPeraturans, setChartPeraturans] = useState({
    categories: [],
    data: [],
  });
  const [chartParameters, setChartParameters] = useState({
    categories: [],
    data: [],
  });

  const data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    datasets: [
      {
        data: [30, 60, 90, 120, 150],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };


  const fetchDashboardData = async (year) => {
    setIsLoading(true);
    try {
      const endpoint = user.role.name === 'customer' ? 'customer' : 'admin';
      const response = await axios.post(`/dashboard/${endpoint}`, { tahun: parseInt(year) });

      setDashboard(response.data);

      // Set chart data if available
      if (response.data.chartSampels) {
        setChartData({
          labels: response.data.chartSampels.categories,
          datasets: [{
            data: response.data.chartSampels.data,
            color: (opacity = 1) => `rgba(49, 46, 129, ${opacity})`,
            strokeWidth: 2,
          }],
        });
      }

      // Set peraturan chart data
      if (response.data.chartPeraturans) {
        const peraturanData = response.data.chartPeraturans;
        const total = peraturanData.data.reduce((acc, value) => acc + value, 0);
        const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0'];

        setChartPeraturans({
          categories: peraturanData.categories,
          data: peraturanData.data.map((value, index) => ({
            name: peraturanData.categories[index],
            population: value,
            percentage: ((value / total) * 100).toFixed(2),
            color: colors[index % colors.length],
          })),
        });
      }

      // Set parameter chart data
      if (response.data.chartParameters) {
        const parameterData = response.data.chartParameters;
        const total = parameterData.data.reduce((acc, value) => acc + value, 0);
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFC300'];

        setChartParameters({
          categories: parameterData.categories,
          data: parameterData.data.map((value, index) => ({
            name: parameterData.categories[index],
            population: value,
            percentage: ((value / total) * 100).toFixed(2),
            color: colors[index % colors.length],
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  // Effect to fetch data when year changes
  useEffect(() => {
    fetchDashboardData(selectedYear);
  }, [selectedYear, user.role.name]);

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 0) => `rgba(49, 46, 129, ${opacity})`,
    strokeWidth: 0,
    barPercentage: 0.5,
    decimalPlaces: 2,
    useShadowColorFromDataset: false,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#e2e8f0",
      strokeDasharray: "0",
    }
  };

  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  const handleYearChange = (event) => {
    const selectedYear = event.nativeEvent.event;
    setSelectedYear(selectedYear);
    fetchDashboardData(selectedYear);
  };

  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedYear]);

  useEffect(() => {
    user.role.name == 'customer' ?
      axios
        .post("/dashboard/" + 'customer', { tahun: tahun })
        .then(response => {
          setDashboard(response.data);
        })
        .catch(error => {
          console.error("error fetching data dashboard ", error);
        })
      :
      axios
        .post("/dashboard/" + 'admin', { tahun: tahun })
        .then(response => {
          setDashboard(response.data);
        })
        .catch(error => {
          console.error("error fetching data dashboard ", error);
        })
  }, []);

  const MainCard = () => {
    const { data: user } = useUser();

    const getFontSize = (text, defaultSize, smallerSize) => {
      return text.length > 15 ? smallerSize : defaultSize; // adjust '15' as per your length requirement
    };

    return (
      <View className="absolute left-0 right-0 px-4" style={{ top: '37%' }}>
        <View className="bg-white rounded-lg shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}>
          <View className="p-4 border-b border-gray-100">
            <View className="flex flex-row justify-between items-center">
              <View className="flex flex-row items-center space-x-3">
                <IonIcons name="person-circle" size={30} color="black" />
                <View>
                  <Text
                    className="font-poppins-semibold text-black"
                    style={{
                      fontSize: getFontSize(user.nama, 18, 14), // Default size 18, smaller size 14
                    }}
                  >
                    Hi, {user.nama}
                  </Text>
                  <Text
                    className="font-poppins-semibold text-gray-500"
                    style={{
                      fontSize: getFontSize(user.email, 14, 12), // Default size 14, smaller size 12
                    }}
                  >
                    {user.email}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="p-5">
            <View className="flex flex-row justify-center gap-16">
              <View className="items-center">
                <TouchableOpacity className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-2"
                  onPress={() => navigation.navigate("IndexMaster")}
                >
                  <IonIcons name="cube" size={26} color="#312e81" />
                </TouchableOpacity>
                <Text className="text-xs font-poppins-semibold text-gray-700">Master</Text>
              </View>
              <View className="h-18 w-[2px] bg-gray-100" />
              <View className="items-center">
                <TouchableOpacity className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-2"
                  onPress={() => navigation.navigate("IndexKonfigurasi")}
                >
                  <IonIcons name="options" size={24} color="#312e81" />
                </TouchableOpacity>
                <Text className="text-xs font-poppins-semibold text-gray-700">Konfigurasi</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };


  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <View className="relative">
          <View className="bg-indigo-900 h-40">
          </View>

          <MainCard />
        </View>

        <View className="items-center mt-28">
          {/* card picker tahun */}
          <View className="bg-white rounded-xl w-[90%] h-16 overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
            }}>
            <View className="flex-row h-full">

              <View className="bg-gradient-to-r from-indigo-900 to-indigo-700 w-1/ justify-center ml-6 ">
                <Text className="text-black text-sm font-poppins-medium">
                  Pilih Tahun Data Dashboard :
                </Text>
              </View>


              <MenuView
                title="Pilih Tahun"
                onPressAction={handleYearChange}
                actions={generateYears().map(option => ({
                  id: option.id.toString(),
                  title: option.title,
                }))}
              >
                <View className="flex-1 flex-row items-center justify-end space-x-3 px-4">
                  <View className="bg-indigo-50 px-4 py-1.5 rounded-lg">
                    <Text className="text-indigo-900 font-poppins-medium">
                      {selectedYear}
                    </Text>
                  </View>

                  <View className="bg-indigo-100 rounded-full p-1.5">
                    <View className="w-4 h-4 items-center justify-center">
                      <View className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-indigo-900 border-r-[4px] border-r-transparent" />
                    </View>
                  </View>
                </View>
              </MenuView>
            </View>

            {/* decor */}
            {/* <View className="absolute top-0 left-0 w-13 h-16">
              <View className="relative w-full h-full">
                <View className="absolute -top-8 -left-8 w-16 h-16 bg-indigo-500 opacity-10 rounded-full" />
                <View className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-400 opacity-10 rounded-full" />
              </View>
            </View> */}
          </View>
        </View>

        <View style={styles.contentContainer}>
          {dashboard ? (
            <>
              {user.role.name === 'customer' ? (
                <>
                  {/* Card 1: Permohonan Baru */}
                  <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#828cff]">
                    <View className="flex-row items-center">
                      <MaterialIcons name="people-alt" size={34} color="#828cff" />
                      <Text className="text-[35px] font-poppins-semibold mx-3 text-[#828cff]">
                        {dashboard.permohonanBaru}
                      </Text>
                    </View>
                    <Text className="text-[16px] font-poppins-semibold text-black text-left">
                      Permohonan Baru
                    </Text>
                  </View>

                  {/* Card 2: Permohonan Diproses */}
                  <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#ffc300]">
                    <View className="flex-row items-center">
                      <FontAwesome5 name="leaf" size={30} color="#ffc300" />
                      <Text className="text-[35px] font-poppins-semibold mx-3 text-[#ffc300]">
                        {dashboard.permohonanDiproses}
                      </Text>
                    </View>
                    <Text className="text-[16px] font-poppins-semibold text-black text-left">
                      Permohonan Diproses
                    </Text>
                  </View>

                  {/* Card 3: Permohonan Selesai */}
                  <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#50cc88]">
                    <View className="flex-row items-center">
                      <FontAwesome5 name="book-open" size={32} color="#50cc88" />
                      <Text className="text-[35px] font-poppins-semibold mx-3 text-[#50cc88]">
                        {dashboard.permohonanSelesai}
                      </Text>
                    </View>
                    <Text className="text-[16px] font-poppins-semibold text-black text-left">
                      Permohonan Selesai
                    </Text>
                  </View>

                  {/* Card 4: Total Permohonan */}
                  <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#5a3dff]">
                    <View className="flex-row items-center">
                      <IonIcons name="book" size={32} color="#5a3dff" />
                      <Text className="text-[35px] font-poppins-semibold mx-3 text-[#5a3dff]">
                        {dashboard.permohonanTotal}
                      </Text>
                    </View>
                    <Text className="text-[16px] font-poppins-semibold text-black text-left">
                      Total Permohonan
                    </Text>
                  </View>
                  <TextFooter />
                </>
              ) : (
                <>
                    <View className="self-center">
                      <Text className="text-xl font-poppins-semibold text-black">
                        Data Dashboard
                      </Text>
                    </View>
                  <View className="w-full bg-indigo-50 mt-4 pt-3 pb-2">

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="pl-4"
                      contentContainerStyle={{ paddingBottom: 8 }}
                    >
                      {['admin', 'kepala-upt'].includes(user.role.name) && (
                        <TouchableOpacity
                          className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#828cff]"
                          onPress={() => navigation.navigate('IndexMaster', { screen: "Users" })}
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                        >
                          <View className="bg-[#828cff] bg-opacity-10 p-3 rounded-full">
                            <IonIcons name="people" size={24} color="white" style={{ width: 24, height: 24 }} />
                          </View>
                          <View className="ml-4 flex-1">
                            <Text className="text-2xl font-poppins-semibold text-[#828cff]">
                              {dashboard.customers}
                            </Text>
                            <Text className="text-sm font-poppins-medium text-black">
                              Customers
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                        <View className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#5a3dff]"
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}>
                          <View className="bg-[#5a3dff] bg-opacity-10 p-3 rounded-full">
                            <IonIcons name="book" size={20} color="white" style={{ width: 20, height: 20, }} />
                          </View>
                          <View className="ml-4 flex-1">
                            <Text className="text-2xl font-poppins-semibold text-[#5a3dff]">
                              {dashboard.allSampels}
                            </Text>
                            <Text className="text-sm font-poppins-medium text-black">
                              Total Permohonan
                            </Text>
                          </View>
                        </View>
                      )}

                      {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                        <TouchableOpacity
                          className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#ffc300]"
                          onPress={() => navigation.navigate('Pengujian', { screen: "Persetujuan" })}
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                        >
                          <View className="bg-[#ffc300] bg-opacity-10 p-3 rounded-full">
                            <IonIcons name="checkmark-sharp" size={20} color="white" style={{ width: 20, height: 20 }} />
                          </View>
                          <View className="ml-4 flex-1">
                            <Text className="text-2xl font-poppins-semibold text-[#ffc300]">
                              {dashboard.newSampels}
                            </Text>
                            <Text className="text-sm font-poppins-medium text-black">
                              Persetujuan Permohonan
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                        <TouchableOpacity
                          className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#f2416e]"
                          onPress={() => navigation.navigate('Pengujian', { screen: 'Analis' })}
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                        >
                          <View className="bg-[#f2416e] bg-opacity-10 p-3 rounded-full">
                            <IonIcons name="flask" size={20} color="white" style={{ width: 20, height: 20 }} />
                          </View>
                          <View className="ml-4 flex-1">
                            <Text className="text-2xl font-poppins-semibold text-[#f2416e]">
                              {dashboard.undoneSampels}
                            </Text>
                            <Text className="text-sm font-poppins-medium text-black">
                              Sampel Belum Dianalisa
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {['admin', 'kepala-upt', 'koordinator-teknis'].includes(user.role.name) && (
                        <TouchableOpacity
                          className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#f2416e]"
                          onPress={() => navigation.navigate('Pengujian', { screen: "Kortek" })}
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                        >
                          <View className="bg-[#f2416e] bg-opacity-10 p-3 rounded-full">
                            <IonIcons name="document-text" size={20} color="white" style={{ width: 20, height: 20 }} />
                          </View>
                          <View className="ml-4 flex-1">
                            <Text className="text-2xl font-poppins-semibold text-[#f2416e]">
                              {dashboard.unverifSampels}
                            </Text>
                            <Text className="text-sm font-poppins-medium text-black">
                              Dokumen Belum Diverifikasi
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      {['admin', 'kepala-upt', 'koordinator-teknis', 'koordinator-administrasi'].includes(user.role.name) && (
                        <TouchableOpacity
                          className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#0fd194]"
                          onPress={() => navigation.navigate('Pembayaran', { screen: "Global" })}
                          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                        >
                          <View className="bg-[#0fd194] bg-opacity-10 p-3 rounded-full">
                            <IonIcons name="cash" size={20} color="white" style={{ width: 20, height: 20 }} />
                          </View>
                          <View className="ml-4 flex-1">
                            <Text className="text-lg font-poppins-semibold text-[#0fd194]">
                              {rupiah(dashboard.revenue)}
                            </Text>
                            <Text className="text-sm font-poppins-medium text-black">
                              Pendapatan
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#0090a6]"
                        onPress={() => navigation.navigate('PengujianKonfig', { screen: "UmpanBalik" })}
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                      >
                        <View className="bg-[#0090a6] bg-opacity-10 p-3 rounded-full">
                          <IonIcons name="ribbon" size={20} color="white" style={{ width: 20, height: 20 }} />
                        </View>
                        <View className="ml-4 flex-1">
                          <Text className="text-2xl font-poppins-semibold text-[#0090a6]">
                            {dashboard.total?.toFixed(2)}
                          </Text>
                          <Text className="text-sm font-poppins-medium text-black">
                            IKM Unit Pelayanan
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="w-80 h-36 mr-8 rounded-lg p-4  flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#0090a6]"
                        onPress={() => navigation.navigate('PengujianKonfig', { screen: "UmpanBalik" })}
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                      >
                        <View className="bg-[#0090a6] bg-opacity-10 p-3 rounded-full">
                          <MaterialCommunityIcons name="clipboard-text" size={20} color="white" style={{ width: 20, height: 20 }} />
                        </View>
                        <View className="ml-4 flex-1">
                          <Text className="text-2xl font-poppins-semibold text-[#0090a6]">
                            {dashboard.jumlah}
                          </Text>
                          <Text className="text-sm font-poppins-medium text-black">
                            Jumlah Responden
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>


                  <View className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mt-4"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                  >
                    <Text className="text-lg font-poppins-semibold text-black p-3">Grafik Tren Permohonan</Text>
                    {/* Pembatas garis di bawah teks */}
                    <View style={{ height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 16 }} />

                    {chartData ? (
                      <LineChart
                        className="font-poppins-semibold"
                        data={chartData}
                        width={screenWidth - 40}
                        height={340}
                        verticalLabelRotation={20}
                        chartConfig={chartConfig}
                        bezier
                        style={{
                          marginVertical: 8,
                          borderRadius: 16
                        }}
                        fromZero
                        yAxisInterval={1}
                      />
                    ) : (
                      <ActivityIndicator size="large" color="#312e81" />
                    )}

                    <Text className="text-[9px] text-gray-500 mt-2 font-poppins-regular self-end">Data Tahun: {selectedYear}</Text>
                  </View>

                  <View className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mt-4"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                  >
                    <Text className="text-lg font-poppins-semibold text-black p-3">
                      {chartPeraturans.data.length > 1
                        ? `${chartPeraturans.data.length} Peraturan Paling Banyak Digunakan`
                        : "Peraturan Paling Banyak Digunakan"}
                    </Text>

                    <View style={{ height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 16 }} />

                    <View className="ml-16">
                      <PieChart
                        className="ml-96 font-poppins-semibold "
                        data={chartPeraturans.data}
                        width={screenWidth}
                        height={220}
                        chartConfig={{
                          backgroundColor: "#1cc910",
                          backgroundGradientFrom: "#eff3ff",
                          backgroundGradientTo: "#efefef",
                          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        hasLegend={false}
                      />
                      <View
                        className="absolute"
                        style={{
                          marginLeft: 72,
                          marginTop: 62,
                          position: "absolute",
                          width: 100,   // Sesuaikan ukuran lingkaran ini untuk membuat lubang sesuai kebutuhan
                          height: 100,
                          backgroundColor: "white",
                          borderRadius: 50, // Ini membuatnya menjadi lingkaran
                        }}
                      />
                    </View>

                    <View className="mt-2 ml-4">
                      {chartPeraturans.data.map((item, index) => (
                        <View key={index} className="flex-row items-center mb-1">
                          <View style={{ backgroundColor: item.color }} className="w-4 h-4 rounded-lg mr-2" />
                          <Text className="font-poppins-semibold break-words max-w-[92%]">
                            <Text className="font-poppins-semibold text-black">{item.percentage}%</Text> - {item.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text className="text-[9px] text-gray-500 mt-10 font-poppins-regular self-end">Data Tahun: {selectedYear}</Text>

                  </View>



                  <View className="bg-white rounded-lg p-2  flex flex-col shadow-lg w-[95%] mb-16 mt-4"
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3, }}
                  >
                    <Text className="text-[17px] text-black font-poppins-semibold p-3 truncate">
                      {chartParameters.data.length > 1
                        ? `${chartParameters.data.length} Parameter Paling Banyak Digunakan`
                        : "Parameter Paling Banyak Digunakan"}
                    </Text>

                    <View style={{ height: 1, backgroundColor: '#e0e0e0', marginHorizontal: 16 }} />

                    <View className="ml-16">
                      <PieChart
                        className="breack-words"
                        data={chartParameters.data}
                        width={screenWidth}
                        height={300}
                        chartConfig={{
                          backgroundColor: "#1cc910",
                          backgroundGradientFrom: "#eff3ff",
                          backgroundGradientTo: "#efefef",
                          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor={"population"}
                        backgroundColor={"transparent"}
                        paddingLeft={"15"}
                        hasLegend={false}
                      />
                      <View
                        className="absolute"
                        style={{
                          marginLeft: 45,
                          marginTop: 75,
                          position: "absolute",
                          width: 150,   // Sesuaikan ukuran lingkaran ini untuk membuat lubang sesuai kebutuhan
                          height: 150,
                          backgroundColor: "white",
                          borderRadius: 100, // Ini membuatnya menjadi lingkaran
                        }}
                      />

                    </View>
                    <View className="mt-2 ml-4">
                      {chartParameters.data.map((item, index) => (
                        <View key={index} className="flex-row items-center mb-1">
                          <View style={{ backgroundColor: item.color }} className="w-4 h-4 rounded-lg mr-2" />
                          <Text className="font-poppins-semibold break-words max-w-[92%]">
                            <Text className="font-poppins-semibold text-black">{item.percentage}%</Text> - {item.name}
                          </Text>
                        </View>
                      ))}
                      <Text className="text-[9px] text-gray-500 mt-9 font-poppins-regular self-end">Data Tahun: {selectedYear}</Text>

                    </View>

                  </View>

                </>
              )}

            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#312e81" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 30,
    paddingTop: 35,
    zIndex: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});


export default Dashboard;