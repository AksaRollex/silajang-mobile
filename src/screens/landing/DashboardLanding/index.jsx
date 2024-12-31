import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import React, { useState } from "react";
import IonIcons from "react-native-vector-icons/Ionicons";
import Header from "../../components/Header";
import FooterLanding from "../component/FooterLanding";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { BarChart } from "react-native-chart-kit";
import { usePengumuman } from "@/src/services/usePengumuman";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useBanner } from "@/src/services/useBanner";
import { APP_URL } from "@env";
import { API_URL } from "@env";
import AskButton from "../component/AskButton";
import { MenuView } from "@react-native-menu/menu";

const DashboardLanding = ({ navigation }) => {
  const [showDropdown, setShowDropdown] = useState(true);
  const [modalVisible, setModalVisible] = useState(true);
  const { data: dataPengumuman } = usePengumuman();
  const screenWidth = Dimensions.get("window").width;
  const { data: dataBanner } = useBanner();
  const formatTanggal = tanggal => {
    const date = new Date(tanggal);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const BannerCarousel = () => {
    const renderItem = ({ item }) => {
      const imageUrl = APP_URL.endsWith("/")
        ? `${APP_URL.slice(0, -1)}${item.gambar}`
        : `${APP_URL}${item.gambar}`;
      return (
        <View style={styles.itemContainer} className="mt-4">
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width: screenWidth - 32 }]}
            resizeMode="cover"
            onError={e =>
              console.log("Image loading error:", e.nativeEvent.error)
            }
            defaultSource={require("../../../../assets/images/avatar.png")}
          />
        </View>
      );
    };

    return (
      <FlatList
        data={dataBanner}
        renderItem={renderItem}
        keyExtractor={item => item.uuid}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={screenWidth - 16}
        contentContainerStyle={styles.contentContainer}
      />
    );
  };

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery(
    ["umpanBalikSummary"],
    async () => {
      try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        console.log("bulan", currentMonth);
        console.log("tahun", currentYear);

        const response = await axios.post(
          `${API_URL}/konfigurasi/umpan-balik/show`,
          {
            bulan: currentMonth,
            tahun: currentYear,
            full: 1,
          },
        );

        console.log("uhuyy", response.data);

        return response.data;
      } catch (error) {
        console.error("Error detail:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        Alert.alert("Error", "Gagal mengambil data summary");
        throw error;
      }
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      retry: 1,
      onSuccess: data => console.log("Query success:", data),
      onError: error => console.log("Query error:", error),
    },
  );

  const renderStats = data => {
    if (!data?.data) return null;

    return (
      <View className=" justify-center items-center flex-row w-full gap-x-1">
        <View
          className="bg-[#F9F9F9]  w-1/2 rounded-lg flex-1 overflow-hidden shadow-sm justify-center items-center"
          style={{
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            borderRightWidth: 1,
            borderRightColor: "#e5e7eb",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            borderLeftWidth: 4,
            borderLeftColor: "#0090a6",
          }}>
          <View className="p-4 ml-4 flex-col justify-center gap-y-2 items-center">
            <IonIcons name="ribbon" size={40} color="#0090a6" />
            <Text className="text-[20px] font-poppins-bold text-[#0090a6]">
              {data.ikm?.toFixed(2)}
            </Text>
            <Text className="text-black font-poppins-regular">
              IKM Unit Pelayanan
            </Text>
          </View>
        </View>

        <View
          className="bg-[#F9F9F9] rounded-lg flex-1 w-1/5 justify-center items-center overflow-hidden shadow-sm "
          style={{
            borderTopWidth: 1,
            borderTopColor: "#e5e7eb",
            borderRightWidth: 1,
            borderRightColor: "#e5e7eb",
            borderBottomWidth: 1,
            borderBottomColor: "#e5e7eb",
            borderLeftWidth: 4,
            borderLeftColor: "#0090a6",
          }}>
          <View className="p-4 ml-4 flex-col justify-center gap-y-2 items-center">
            <MaterialCommunityIcons
              name="clipboard-text"
              size={40}
              color="#0090a6"
            />
            <Text className="text-[20px] font-poppins-bold text-[#0090a6]">
              {data.data?.jumlah}
            </Text>
            <Text className="text-black font-poppins-regular">
              Jumlah Responden
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderChart = data => {
    if (!data?.data) return null;
    const chartData = {
      labels: ["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9"],
      datasets: [
        {
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
          ],
        },
      ],
    };

    return (
      <View className="ml-4">
        <View className="  bg-white rounded-lg" style={{ marginLeft: -15 }}>
          <BarChart
            data={chartData}
            width={Dimensions.get("window").width - 60}
            height={250}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(49, 46, 129, ${opacity})`,
              barPercentage: 0.7,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
              },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: "#e3e3e3",
              },
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

  // const dropdownOptions = [
  //   {
  //     id: "Edit Kontrak",
  //     title: "Edit Kontrak",
  //     action: item => navigation.navigate("OpenKontrak", { uuid: item.uuid }),
  //     Icon: "edit",
  //   },
  // ];
  return (
    <View className="w-full h-full">
      <ScrollView
        className="flex-col "
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}>
        <ImageBackground
          source={require("../../../../assets/images/background.png")}
          style={{
            flex: 1,
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <Header />
        </ImageBackground>

        {dataBanner && dataBanner.length > 0 && <BannerCarousel />}

        <View className="flex-col p-3">
          <Text className="text-lg font-poppins-bold text-center text-[#252a61] capitalize">
            indeks kepuasan masyarakat layanan pengujian laboratorium
          </Text>

          <View className="my-4">{renderStats(summaryData)}</View>
          {/* <View className="justify-end items-end mx-2">
            <MenuView
              title="Menu Title"
              actions={dropdownOptions.map(option => ({
                ...option,
              }))}
              onPressAction={({ nativeEvent }) => {
                const selectedOption = dropdownOptions.find(
                  option => option.title === nativeEvent.event,
                );
                if (selectedOption) {
                  selectedOption.action(item);
                }
              }}
              shouldOpenOnLongPress={false}>
              <View>
                <IonIcons name="list-circle" size={40} color="#0090a6" />
              </View>
            </MenuView>
          </View> */}

          <View className="my-4 ">{renderChart(summaryData)}</View>

          {summaryData?.keterangan && (
            <View className="p-3 w-full bg-slate-50 rounded-lg">
              {summaryData.keterangan.map(item => (
                <View
                  key={item.id}
                  className="flex-row justify-between p-2 bg-white mb-2 rounded-md shadow">
                  <Text className="text-black font-poppins-bold uppercase">
                    {item.kode}
                  </Text>
                  <Text className="text-black font-poppins-regular capitalize">
                    {item.keterangan}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <AskButton />
        <FooterLanding />
      </ScrollView>
      {dataPengumuman && (
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View className="flex-1 justify-center items-center bg-black/50 py-6 px-2">
            <View className="w-full h-full bg-[#f8f8f8] rounded-2xl p-6 justify-start shadow-2xl">
              <View className="justify-between  flex-row items-center mb-3">
                <Text className="text-2xl font-poppins-bold text-black ">
                  Pengumuman
                </Text>
                <AntDesign
                  name="close"
                  size={24}
                  color="black"
                  onPress={() => setModalVisible(false)}
                />
              </View>
              <View className="flex-col p-2 border-gray-400 border-[0.3px] rounded-t-lg ">
                <Text className="text-md text-start text-black capitalize font-poppins-regular">
                  {formatTanggal(dataPengumuman[0].created_at) ||
                    "Tanggal tidak tersedia"}
                </Text>
                <Text className="text-lg text-start text-[#252a61] upperacase font-poppins-semibold">
                  {dataPengumuman[0].judul || "Isi tidak tersedia"}
                </Text>
              </View>
              <View className=" border-gray-400 border-[0.3px] rounded-b-lg p-2">
                <Text className="text-md text-start text-black capitalize font-poppins-regular">
                  {dataPengumuman[0].isi || "Isi tidak tersedia"}
                </Text>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default DashboardLanding;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 8,
  },
  itemContainer: {
    paddingHorizontal: 8,
  },
  image: {
    height: 200,
    borderRadius: 12,
  },
});
