import axios from "@/src/libs/axios";
import { rupiah } from "@/src/libs/utils";
import { useUser } from "@/src/services";
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, StackedBarChart } from "react-native-chart-kit";
import { TouchableOpacity } from "react-native-gesture-handler";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Fontisto from "react-native-vector-icons/Fontisto";
import IonIcons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextFooter } from "../components/TextFooter";
import { Dimensions } from "react-native";
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


  const YearSelector = () => (
    <View className="w-full ml-72 mt-1 mb-4">
      <MenuView
        title="Pilih Tahun"
        onPressAction={handleYearChange}
        actions={generateYears().map(option => ({
          id: option.id.toString(),
          title: option.title,
        }))}>
        <View style={{ marginRight: 10 }}>
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "white",
            padding: 8,
            borderRadius: 8,
            width: 120,
            borderColor: "#d1d5db",
            borderWidth: 1
          }}>
            <Text style={{ color: "black", flex: 1, textAlign: "center", fontSize: 14, }}>
              {`Tahun: ${selectedYear}`}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="black" />
          </View>
        </View>
      </MenuView>
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      showsVerticalScrollIndicator={false}>
      {dashboard ? (
        <>
          {user.role.name === 'customer' ? (
            <>
              <View style={[styles.cardContainer, styles.cardNew]}>

                <View style={styles.row}>
                  <MaterialIcons name="people-alt" size={34} color={"#828cff"} />
                  <Text style={[styles.cardNumber, styles.card1]}>
                    {dashboard.permohonanBaru}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Permohonan Baru
                </Text>
              </View>

              <View style={[styles.cardContainer, styles.cardCompleted]}>
                <View style={styles.row}>
                  <FontAwesome5 name="leaf" size={30} color={"#ffc300"} />
                  <Text style={[styles.cardNumber, styles.card3]}>
                    {dashboard.permohonanDiproses}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Permohonan Diproses
                </Text>
              </View>

              <View style={[styles.cardContainer, styles.cardTotal]}>
                <View style={styles.row}>
                  <FontAwesome5 name="book-open" size={32} color={"#50cc88"} />
                  <Text style={[styles.cardNumber, styles.card4]}>
                    {dashboard.permohonanSelesai}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Permohonan Selesai
                </Text>
              </View>

              <View style={[styles.cardContainer, styles.cardProcess]}>
                <View style={styles.row}>
                  <FontAwesome5 name="wallet" size={32} color={"#5a3dff"} />
                  <Text style={[styles.cardNumber, styles.card2]}>
                    {dashboard.permohonanTotal}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Total Permohonan
                </Text>
              </View>
              <TextFooter />
            </>

          ) : (
            <>
              <View >
                {/* <View className="w-full ml-72 mt-1 mb-4">
                  <MenuView
                    title="Pilih Tahun"
                    onPressAction={handleYearChange}
                    actions={generateYears().map(option => ({
                      id: option.id.toString(),
                      title: option.title,
                    }))}>
                    <View style={{ marginRight: 10 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "white",
                          padding: 8,
                          borderRadius: 8,
                          width: 120,
                          borderColor: "#d1d5db",
                          borderWidth: 1
                        }}>
                        <Text style={{ color: "black", flex: 1, textAlign: "center", fontSize: 14 }}>
                          {`Tahun: ${selectedYear}`}
                        </Text>
                        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                      </View>
                    </View>
                  </MenuView>
                </View> */}

                <YearSelector />
                
              </View>
              

              {['admin', 'kepala-upt'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#828cff]">
                  <View className="flex-row items-center">
                    <MaterialIcons name="people-alt" size={34} color={"#828cff"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#828cff]">
                      {dashboard.customers}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Customers
                  </Text>
                </View>
              )}

              {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#5a3dff]">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="file-contract" size={30} color={"#5a3dff"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#5a3dff]">
                      {dashboard.allSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Total Permohonan
                  </Text>
                </View>
              )}

              {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                <TouchableOpacity className="w-48 h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#ffc300]"
                  onPress={() => navigation.navigate('Pengujian', { screen: "Persetujuan" })}>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="check-circle" size={30} color={"#ffc300"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#ffc300]">
                      {dashboard.newSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Persetujuan Permohonan
                  </Text>
                </TouchableOpacity>
              )}

              {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                <TouchableOpacity className=" w-48 h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#f2416e]"
                  onPress={() => navigation.navigate('Pengujian', { screen: 'Analis' })}>
                  <View className="flex-row items-center">
                    <Fontisto name="laboratory" size={30} color={"#f2416e"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#f2416e]">
                      {dashboard.undoneSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Sampel Belum Dianalisa
                  </Text>
                </TouchableOpacity>
              )}

              {['admin', 'kepala-upt','koordinator-teknis'].includes(user.role.name) && (
                <TouchableOpacity className="w-48 h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#f2416e]"
                  onPress={() => navigation.navigate('Pengujian', { screen: "Kortek" })}>
                  <View className="flex-row items-center">
                    <IonIcons name="document-text" size={30} color={"#f2416e"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#f2416e]">
                      {dashboard.unverifSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Dokumen Belum Diverifikasi
                  </Text>
                </TouchableOpacity>
              )}

              {['admin', 'kepala-upt', 'koordinator-teknis', 'koordinator-administrasi'].includes(user.role.name) && (
                <TouchableOpacity className="w-48 h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#0fd194]"
                  onPress={() => navigation.navigate('Pembayaran', { screen: "Global" })}>
                  <View>
                    <FontAwesome5 name="coins" size={30} color={"#0fd194"} />
                    <Text className="text-[18px] font-extrabold text-[#0fd194]" >
                      {rupiah(dashboard.revenue)}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Pendapatan
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity className="w-48 h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#0090a6]"
                onPress={() => navigation.navigate('Konfigurasi', { screen: "umpan-balik" })}>
                <View className="flex flex-row">
                  <FontAwesome5 name="medal" size={30} color={"#0090a6"} />
                  <Text className="text-3xl font-extrabold mx-3 text-[#0090a6]" >
                    {dashboard.total?.toFixed(2)}
                  </Text>
                </View>
                <Text className="text-[16px] font-medium text-black text-left">
                  IKM Unit Pelayanan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="w-48 h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#0090a6]"
                onPress={() => navigation.navigate('Konfigurasi', { screen: "umpan-balik" })}>
                <View className="flex flex-row">
                  <IonIcons name="clipboard" size={30} color={"#0090a6"} />
                  <Text className="text-3xl font-extrabold mx-3 text-[#0090a6]" >
                    {dashboard.jumlah}
                  </Text>
                </View>
                <Text className="text-[16px] font-medium text-black text-left">
                  Jumlah Responden
                </Text>
              </TouchableOpacity>


                <View className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mt-4">
                  <Text className="text-lg font-bold p-3">Grafik Tren Permohonan</Text>
                  {chartData ? (
                    <LineChart
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
                </View>
        


              <View className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mt-4">
                <Text className="text-lg font-bold p-3">
                  {chartPeraturans.data.length > 1
                    ? `${chartPeraturans.data.length} Peraturan Paling Banyak Digunakan`
                    : "Peraturan Paling Banyak Digunakan"}
                </Text>

                <View className="ml-16">
                  <PieChart
                    className="ml-96"
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
                </View>

                <View style={styles.legendContainer} className="break-words">
                  {chartPeraturans.data.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>
                        <Text className="text-[12px] font-extrabold">{item.percentage}%</Text> - {item.name}
                      </Text>

                    </View>
                  ))}
                </View>
              </View>




              <View className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mb-16 mt-4">
                <Text className="text-lg font-bold p-3 truncate">
                  {chartParameters.data.length > 1
                    ? `${chartParameters.data.length} Parameter Paling Banyak Digunakan`
                    : "Parameter Paling Banyak Digunakan"}
                </Text>

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
                  // avoidFalseZeros={true}
                  />


                </View>
                <View style={styles.legendContainer} className="break-words">
                  {chartParameters.data.map((item, index) => (
                    <View key={index} style={styles.legendItem} >
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>
                        <Text className="text-[12px] font-extrabold ml-4">{item.percentage}%</Text> - {item.name}
                      </Text>

                    </View>
                  ))}
                </View>

              </View>

            </>
          )}

        </>
      ) : (
        <View className="h-full justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
      )}

    </ScrollView>
  )
};

const styles = StyleSheet.create({
  legendContainer: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 20,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#333",
  },

  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  logoFiles: {
    width: 55,
    height: 55,
  },
  logoProcess: {
    width: 55,
    height: 55,
  },
  logoChecked: {
    width: 55,
    height: 55,
  },
  logoSelectAll: {
    width: 55,
    height: 55,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    alignSelf: "center",
  },
  searchFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  picker: {
    width: 90,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    color: "black",
    backgroundColor: "white",
  },
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  cardContainer: {
    width: "45%",
    height: 140,
    marginVertical: 10,
    borderRadius: 7,
    padding: 20,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardNew: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#828cff",
    borderTopWidth: 6,
  },
  cardProcess: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#5a3dff",
    borderTopWidth: 6,
  },
  cardCompleted: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#ffc300",
    borderTopWidth: 6,
  },
  cardTotal: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#50cc88",
    borderTopWidth: 6,
  },
  cardTotals: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#0fd194",
    borderTopWidth: 6,
  },
  cardLast: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#0090a6",
    borderTopWidth: 6,
  },
  cardNumber: {
    fontSize: 35,
    fontWeight: "800",
    marginHorizontal: 12,
  },
  cardCurrency: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 6,
  },
  cardTextColor: {
    color: "black",
  },
  cardInfoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
    textAlign: "left",
  },
  card1: {
    color: "#828cff",
  },
  card2: {
    color: "#5a3dff",
  },
  card3: {
    color: "#ffc300",
  },
  card4: {
    color: "#50cc88",
  },
  chartContainer: {
    marginVertical: 20,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "rgba(100,100,100,0.2)",
  },
  chartHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginLeft: 8, // memberikan jarak antara gambar dan teks
  },
  chartStyle: {
    marginTop: 8,
    marginBottom: 40,
    borderRadius: 10,
  },
  logoFiles: {
    width: 24,
    height: 24,
  },
  logoProcess: {
    width: 24,
    height: 24,
  },
  logoChecked: {
    width: 24,
    height: 24,
  },
  logoSelectAll: {
    width: 24,
    height: 24,
  },
  footer: {
    padding: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    color: "gray",
  },
});

export default Dashboard;
