import axios from "@/src/libs/axios";
import { formatRupiahShort } from "@/src/libs/utils";
import { useUser } from "@/src/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MenuView } from "@react-native-menu/menu";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import Toast from "react-native-toast-message";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import IonIcons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextFooter } from "../components/TextFooter";
import DataModal from "../components/DataModal";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [dataDashboard, setDataDashboard] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const scrollViewRef = useRef(null);

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
  const [isRefreshingYear, setIsRefreshingYear] = useState(false);
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
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ],
    datasets: [
      {
        data: [30, 60, 90, 120, 150],
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const fetchDashboardData = async year => {
    setIsLoading(true);
    try {
      const endpoint = user.role.name === "customer" ? "customer" : "admin";
      const response = await axios.post(`/dashboard/${endpoint}`, {
        tahun: parseInt(year),
      });

      setDashboard(response.data);
      // Set chart data if available
      if (response.data.chartSampels) {
        setChartData({
          labels: response.data.chartSampels.categories,
          datasets: [
            {
              data: response.data.chartSampels.data,
              color: (opacity = 1) => `rgba(49, 46, 129, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        });
      }

      // Set peraturan chart data
      if (response.data.chartPeraturans) {
        const peraturanData = response.data.chartPeraturans;
        const total = peraturanData.data.reduce((acc, value) => acc + value, 0);
        const colors = ["#008FFB", "#00E396", "#FEB019", "#FF4560", "#775DD0"];

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
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFC300"];

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
    } finally {
      setIsLoading(false);
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
    },
  };

  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  const handleYearChange = event => {
    const selectedYear = event.nativeEvent.event;
    setSelectedYear(selectedYear);
    setIsLoading(true);
    fetchDashboardData(selectedYear);
    refetch()
  };

  const {
    data: dashboardData,
    isLoading: isLoadingDataDashboard,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", selectedYear],
    queryFn: async () =>
      axios
        .post("/dashboard/" + "admin", { tahun: selectedYear })
        .then(res => res.data),
    onSuccess: res => {
      setDashboard(res);
      setDataDashboard([
        {
          data: res.customers,
          name: "Customer",
          color: "#5a3dff",
          icon: "people",
          navigation: "IndexMaster",
          screen: "Users",
          params: { golongan_id: 1 },
          permission: ["admin", "kepala-upt"],
        },
        {
          data: res.allSampels,
          name: "Total\nPermohonan",
          color: "#5a3dff",
          icon: "book",
          navigation: "Pengujian",
          screen: "Persetujuan",
          permission: ["admin", "kepala-upt", "koordinator-administrasi"],
        },
        {
          data: res.newSampels,
          name: "Persetujuan\nPermohonan",
          color: "#ffc300",
          icon: "checkmark-circle",
          navigation: "Pengujian",
          screen: "Persetujuan",
          permission: ["admin", "kepala-upt", "koordinator-administrasi"],
        },
        {
          data: res.undoneSampels,
          name: "Sampel\nBelum Dianalisa",
          color: "#f2416e",
          icon: "flask",
          navigation: "Pengujian",
          screen: "Analis",
          permission: ["admin", "kepala-upt", "koordinator-administrasi"],
        },
        {
          data: res.unverifSampels,
          name: "Dokumen\nBelum Diverifikasi",
          color: "#f2416e",
          icon: "document-text",
          navigation: "Pengujian",
          screen: "Kortek",
          permission: ["admin", "kepala-upt", "koordinator-teknis"],
        },
        {
          data: formatRupiahShort(res.revenue),
          name: "Pendapatan",
          color: "#0fd194",
          icon: "cash",
          navigation: "Pembayaran",
          screen: "Global",
          permission: [
            "admin",
            "kepala-upt",
            "koordinator-teknis",
            "koordinator-administrasi",
          ],
        },
        {
          data: res.total?.toFixed(2),
          name: "IKM Unit\nPelayanan",
          color: "#0090a6",
          icon: "ribbon",
          navigation: "PengujianKonfig",
          screen: "UmpanBalik",
          permission: [
            "admin", 
            "kepala-upt",
            "koordinator-teknis",
            "koordinator-administrasi",
            "analis",
            "pengambil-sample", 
          ],
        },
        {
          data: res.jumlah,
          name: "Jumlah\nResponden",
          color: "#0090a6",
          icon: "clipboard",
          navigation: "PengujianKonfig",
          screen: "UmpanBalik",
          permission: [
            "admin", 
            "kepala-upt",
            "koordinator-teknis",
            "koordinator-administrasi",
            "analis",
            "pengambil-sample", 
          ],
        },
      ]);
    },
    onError: (error) => console.error(error),
  });

  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedYear]);

  const MainCard = () => {
    const { data: user } = useUser();
    const [modalVisible, setModalVisible] = useState(false);
    const queryClient = useQueryClient();

    const getFontSize = (text, defaultSize) => {
      return text.length > 18 ? defaultSize : defaultSize;
    };

    const isSimplifiedView = ["pengambil-sample", "analis", "customer"].includes(
      user.role.name,
    );
    const isAdmin = user.role.name === "admin";

    const { mutate: logout } = useMutation(() => axios.post("/auth/logout"), {
      onSuccess: async () => {
        await AsyncStorage.removeItem("@auth-token");
        Toast.show({
          type: "success",
          text1: "Logout Berhasil",
        });
        queryClient.invalidateQueries(["auth", "user"]);
      },
      onError: () => {
        Toast.show({
          type: "error",
          text1: "Gagal Logout",
        });
      },
    });

    const getDisplayName = fullName => {
      if (!fullName) return "";

      const [nameBeforeComma] = fullName.split(",");
      const nameParts = nameBeforeComma.trim().split(" ");
      if (nameParts.length > 2) {
        return `${nameParts[0]} ${nameParts[1]}`;
      }

      return nameBeforeComma.trim();
    };

    const displayName = getDisplayName(user.nama);

    const handleLogout = () => {
      setModalVisible(true);
    };

    const confirmLogout = () => {
      setModalVisible(false);
      logout();
    };

    return (
      <View
        className="absolute left-0 right-0 px-4"
        style={{
          top: isSimplifiedView ? "70%" : "20%",
        }}>
        <View
          className="bg-white rounded-lg shadow-lg"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}>
          <View
            className={`p-4 ${
              !isSimplifiedView ? "border-b border-gray-100" : ""
            }`}>
            <View className="flex flex-row justify-between items-center">
              <View className="flex flex-row items-center space-x-3">
                <IonIcons
                  name="person-circle"
                  size={Platform.select({ ios: 30, android: 26 })}
                  color="black"
                />
                <View>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    className="font-poppins-semibold text-black"
                    style={{
                      fontSize: getFontSize(displayName, 18, 14),
                      maxWidth: Platform.select({ ios: 200, android: 180 }),
                    }}>
                    Hi, {displayName}
                  </Text>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    className="font-poppins-semibold text-gray-500"
                    style={{
                      fontSize: getFontSize(user.email, 14, 10),
                      maxWidth: Platform.select({ ios: 200, android: 180 }),
                    }}>
                    {user.email}
                  </Text>
                </View>
              </View>
              {isAdmin && (
                <TouchableOpacity
                  className="bg-red-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full flex flex-row items-center space-x-1"
                  onPress={handleLogout}
                  activeOpacity={0.7}>
                  <IonIcons
                    name="log-out-outline"
                    size={Platform.select({ ios: 16, android: 14 })}
                    color="#f2416e"
                  />
                  <Text
                    className="text-red-500 font-poppins-semibold"
                    style={{
                      fontSize: Platform.select({ ios: 12, android: 10 }),
                    }}>
                    Logout
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {!isSimplifiedView && (
            <View className="p-5">
              {isAdmin ? (
                // Admin view dengan 2 menu
                <View className="flex flex-row justify-center gap-16">
                  <View className="items-center">
                    <TouchableOpacity
                      className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-2"
                      onPress={() =>
                        navigation.navigate("IndexMaster", {
                          screen: "MasterIndex",
                        })
                      }>
                      <IonIcons name="cube" size={26} color="#312e81" />
                    </TouchableOpacity>
                    <Text className="text-xs font-poppins-semibold text-gray-700">
                      Master
                    </Text>
                  </View>
                  <View className="h-18 w-[2px] bg-gray-100" />
                  <View className="items-center">
                    <TouchableOpacity
                      className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-2"
                      onPress={() => navigation.navigate("IndexKonfigurasi")}>
                      <IonIcons name="options" size={24} color="#312e81" />
                    </TouchableOpacity>
                    <Text className="text-xs font-poppins-semibold text-gray-700">
                      Konfigurasi
                    </Text>
                  </View>
                </View>
              ) : (
                // pengambil-sample & analis view
                <View className="px-2 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                  <TouchableOpacity
                    className="bg-gradient-to-r from-indigo-100 to-blue-50 rounded-xl p-1 flex-row items-center justify-between"
                    onPress={() => navigation.navigate("IndexKonfigurasi")}>
                    <View className="flex-row items-center space-x-3">
                      <View className="bg-indigo-50 w-12 h-12 rounded-full items-center justify-center">
                        <IonIcons name="options" size={24} color="#312e81" />
                      </View>
                      <View>
                        <Text className="text-sm font-poppins-semibold text-black">
                          Konfigurasi
                        </Text>
                        <Text className="text-xs font-poppins-regular text-gray-600">
                          Lihat Tracking Pengujian
                        </Text>
                      </View>
                    </View>
                    <IonIcons
                      name="chevron-forward"
                      size={20}
                      color="#312e81"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
                <IonIcons size={40} color="#f43f5e" name="log-out-outline" />
              </View>

              <Text className="text-xl font-poppins-semibold text-black mb-3">
                Konfirmasi Logout
              </Text>

              <View className="w-full h-px bg-gray-200 mb-4" />

              <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
                Apakah anda yakin ingin logout?
              </Text>

              <View className="flex-row w-full justify-between">
                <TouchableOpacity
                  onPress={confirmLogout}
                  className="flex-1 mr-2 bg-red-500 py-3 rounded-xl items-center">
                  <Text className="text-white font-poppins-medium">
                    Ya, Logout
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="flex-1 ml-3 bg-gray-100 py-3 rounded-xl items-center">
                  <Text className="text-gray-700 font-poppins-medium">
                    Batal
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 mb-14">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="relative">
          <View className="bg-indigo-900 h-40"></View>

          <MainCard />
        </View>

        <View className="items-center mt-20 sm:mt-[85px]">
          <View
            className="bg-white rounded-xl sm:w-[91%] overflow-hidden p-3"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 3,
            }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2 ">
                <Text className="text-black font-poppins-medium text-[12px] sm:text-sm">
                  Pilih Tahun Data Dashboard:
                </Text>
                <View className="bg-indigo-50 px-2 py-1 rounded-lg">
                  <Text className="text-indigo-900 font-poppins-medium text-[12px] sm:text-sm">
                    {selectedYear}
                  </Text>
                </View>
                <MenuView
                  title="Pilih Tahun"
                  onPressAction={handleYearChange}
                  actions={generateYears().map(option => ({
                    id: option.id.toString(),
                    title: option.title,
                  }))}>
                  <View className="bg-indigo-100 rounded-full p-1.5">
                    <View className="w-3 h-3 items-center justify-center">
                      <View className="w-0 h-0 border-l-[3px] border-l-transparent border-t-[5px] border-t-indigo-900 border-r-[3px] border-r-transparent" />
                    </View>
                  </View>
                </MenuView>
              </View>
            </View>
          </View>
        </View>

        {isLoading && isLoadingDataDashboard ? (
          <View style={[styles.loadingContainer, { marginTop: 50 }]}>
            <ActivityIndicator size="large" color="#312e81" />
          </View>
        ) : dashboard ? (
          <View style={styles.contentContainer}>
            {user.role.name === "customer" ? (
              <>
                {/* Card 1: Permohonan Baru */}
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#828cff]">
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="people-alt"
                      size={34}
                      color="#828cff"
                    />
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
                {/* <View className="self-center">
                  <Text className="text-xl font-poppins-semibold text-black">
                    Data Dashboard
                  </Text>
                </View> */}
                <View className="w-full mt-3 pb-2">
                  <View
                    className="w-full flex gap-1 flex-row flex-wrap justify-center"
                    contentContainerStyle={{ paddingBottom: 8 }}>
                    {/* {['admin', 'kepala-upt'].includes(user.role.name) && (
                      <TouchableOpacity
                        className="rounded-xl p-3 flex flex-col items-center justify-center bg-transparent "
                        onPress={() => navigation.navigate('IndexMaster', { screen: "Users", params: { golongan_id: 1 } })}
                      >
                        <View className="p-6 bg-white rounded-xl shadow-lg">
                          <IonIcons name="people" size={20} color="#828cff" />
                        </View>
                        <View className="bg-[#5a3dff] bg-opacity-10 p-2 rounded-full right-0 top-5 absolute">
                          <Text className="text-xs font-poppins-semibold text-white">
                            {dashboard.customers}
                          </Text>
                        </View>
                        <Text className="font-poppins-semibold mt-2 text-black">Customer</Text>
                      </TouchableOpacity>
                    )} */}

                    {dataDashboard
                      .filter(item => item.permission.includes(user.role.name))
                      .map((item, index) => {
                        if (
                          index <= 2 &&
                          ["admin", "kepala-upt"].includes(user.role.name)
                        ) {
                          // Menampilkan 3 card pertama
                          return (
                            <TouchableOpacity
                              key={index}
                              className="rounded-xl h-24 w-24 flex flex-col items-center justify-center bg-transparent "
                              onPress={() =>
                                navigation.navigate(item.navigation, {
                                  screen: item.screen,
                                  params: item.params,
                                })
                              }>
                              <View className="p-5 bg-white rounded-xl shadow-lg">
                                <IonIcons
                                  name={item.icon}
                                  size={24}
                                  color={item.color}
                                />
                              </View>
                              <View
                                className={`bg-[${item.color}] bg-opacity-10 p-1 rounded-full right-0 top-0 absolute`}>
                                <Text className="text-xs font-poppins-semibold text-white">
                                  {item.data > 99 ? "99+" : item.data}
                                </Text>
                              </View>
                              <Text
                                className="font-poppins-semibold text-xs mt-2 text-center text-black"
                                style={{  
                                  minHeight: 50, 
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",}}>
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        } else if (
                          index === 3 &&
                          ["admin", "kepala-upt", "koordinator-administrasi"].includes(user.role.name)
                        ) {
                          // Menampilkan "Read More" card setelah 3 item
                          return (
                            <TouchableOpacity
                              key={index}
                              className="rounded-xl w-24 h-24 flex flex-col items-center justify-center bg-transparent"
                              onPress={() => {
                                setModalVisible(true);
                              }} // Ganti dengan navigasi sesuai kebutuhan
                            >
                              <View className="p-5 bg-white rounded-xl shadow-lg">
                                <IonIcons
                                  name="list"
                                  size={24}
                                  color={"#828cff"}
                                />
                              </View>
                              <Text
                                className="font-poppins-semibold text-xs text-center mt-2 text-black"
                                style={{  
                                  minHeight: 50, 
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center", }}>
                                Read More
                              </Text>
                            </TouchableOpacity>
                          );
                        } else if (
                          index <= 3 &&
                          !["admin", "kepala-upt"].includes(user.role.name)
                        ) {
                          return (
                            <TouchableOpacity
                              key={index}
                              className="rounded-xl w-24 h-24 flex flex-col items-center justify-center bg-transparent"
                              onPress={() =>
                                navigation.navigate(item.navigation, {
                                  screen: item.screen,
                                  params: item.params,
                                })
                              }>
                              <View className="p-5 bg-white rounded-xl shadow-lg">
                                <IonIcons
                                  name={item.icon}
                                  size={24}
                                  color={item.color}
                                />
                              </View>
                              <View
                                className={`bg-[${item.color}] bg-opacity-10 p-1 rounded-full right-0 top-0 absolute`}>
                                <Text className="text-xs font-poppins-semibold text-white">
                                  {item.data > 99 ? "99+" : item.data}
                                </Text>
                              </View>
                              <Text
                                className="font-poppins-semibold text-xs text-center mt-2 text-black"
                                style={{ 
                                  minHeight: 50, 
                                  textAlign: "center",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center", 
                                  }}>
                                {item.name}
                              </Text>
                            </TouchableOpacity>
                          );
                        }
                      })}

                    <DataModal
                      visible={modalVisible}
                      onClose={() => setModalVisible(false)}
                      data={dataDashboard}
                      navigation={navigation}
                      userRole={user.role.name}
                    />

                    {/* {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                      <TouchableOpacity className="w-80 h-36 mr-4 rounded-lg p-4 flex flex-row items-center shadow-lg bg-white border-l-[6px] border-[#5a3dff]"
                        onPress={() => navigation.navigate('Pengujian', { screen: "Persetujuan" })}
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
                      </TouchableOpacity>
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
                      onPress={() => {
                        if (['admin'].includes(user.role.name)) {
                          navigation.navigate('PengujianKonfig', { screen: "UmpanBalik" })
                        }
                      }}
                      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 }}
                    >
                      <View className="bg-[#0090a6] bg-opacity-10 p-3 rounded-full">
                        <IonIcons
                          name="ribbon"
                          size={20}
                          color="white"
                          style={{ width: 20, height: 20 }}
                        />
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
                      onPress={() => {
                        if (['admin'].includes(user.role.name)) {
                          navigation.navigate('PengujianKonfig', { screen: "UmpanBalik" })
                        }
                      }}
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
                    </TouchableOpacity> */}
                  </View>
                </View>

                <View
                  className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mt-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}>
                  <Text className="text-lg font-poppins-semibold text-black p-3">
                    Grafik Tren Permohonan
                  </Text>
                  {/* Pembatas garis di bawah teks */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#e0e0e0",
                      marginHorizontal: 16,
                    }}
                  />

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
                        borderRadius: 16,
                      }}
                      fromZero
                      yAxisInterval={1}
                    />
                  ) : (
                    <ActivityIndicator size="large" color="#312e81" />
                  )}

                  <Text className="text-[9px] text-gray-500 mt-2 font-poppins-regular self-end">
                    Data Tahun: {selectedYear}
                  </Text>
                </View>

                <View
                  className="bg-white rounded-lg p-2 flex flex-col shadow-lg w-[95%] mt-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}>
                  <Text className="text-lg font-poppins-semibold text-black p-3">
                    {chartPeraturans.data.length > 1
                      ? `${chartPeraturans.data.length} Peraturan Paling Banyak Digunakan`
                      : "Peraturan Paling Banyak Digunakan"}
                  </Text>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#e0e0e0",
                      marginHorizontal: 16,
                    }}
                  />

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
                      className="absolute "
                      style={{
                        marginLeft: 72,
                        marginTop: 59,
                        position: "absolute",
                        width: 100, // Sesuaikan ukuran lingkaran ini untuk membuat lubang sesuai kebutuhan
                        height: 100,
                        backgroundColor: "white",
                        borderRadius: 50, // Ini membuatnya menjadi lingkaran
                      }}
                    />
                  </View>

                  <View className="mt-2 ml-4">
                    {chartPeraturans.data.map((item, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <View
                          style={{ backgroundColor: item.color }}
                          className="w-4 h-4 rounded-lg mr-2"
                        />
                        <Text className="font-poppins-semibold break-words max-w-[92%] text-gray-500">
                          <Text className="font-poppins-semibold text-black">
                            {item.percentage}%
                          </Text>{" "}
                          - {item.name}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <Text className="text-[9px] text-gray-500 mt-10 font-poppins-regular self-end">
                    Data Tahun: {selectedYear}
                  </Text>
                </View>

                <View
                  className="bg-white rounded-lg p-2  flex flex-col shadow-lg w-[95%] mb-16 mt-4"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                  }}>
                  <Text className="text-[17px] text-black font-poppins-semibold p-3 truncate">
                    {chartParameters.data.length > 1
                      ? `${chartParameters.data.length} Parameter Paling Banyak Digunakan`
                      : "Parameter Paling Banyak Digunakan"}
                  </Text>

                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#e0e0e0",
                      marginHorizontal: 16,
                    }}
                  />

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
                        width: 150, // Sesuaikan ukuran lingkaran ini untuk membuat lubang sesuai kebutuhan
                        height: 150,
                        backgroundColor: "white",
                        borderRadius: 100, // Ini membuatnya menjadi lingkaran
                      }}
                    />
                  </View>
                  <View className="mt-2 ml-4">
                    {chartParameters.data.map((item, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <View
                          style={{ backgroundColor: item.color }}
                          className="w-4 h-4 rounded-lg mr-2"
                        />
                        <Text className="font-poppins-semibold break-words max-w-[92%] text-gray-500">
                          <Text className="font-poppins-semibold text-black">
                            {item.percentage}%
                          </Text>{" "}
                          - {item.name}
                        </Text>
                      </View>
                    ))}
                    <Text className="text-[9px] text-gray-500 mt-9 font-poppins-regular self-end">
                      Data Tahun: {selectedYear}
                    </Text>
                  </View>
                </View>
                <TextFooter className="top-1" />
              </>
            )}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#312e81" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Dashboard;
