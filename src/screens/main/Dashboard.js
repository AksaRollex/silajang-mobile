import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Modal,
  ImageBackground,
  RefreshControl,
} from "react-native";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DefaultAvatar from "../../../assets/images/avatar.png";
import { useNavigation } from "@react-navigation/native";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import IonIcons from "react-native-vector-icons/Ionicons";
import FastImage from "react-native-fast-image";
import AntDesign from "react-native-vector-icons/AntDesign";
import FooterText from "../components/FooterText";
const windowWidth = Dimensions.get("window").width;
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const { data: userData } = useUser();
  // console.log('userData: ', userData);

  const openImageViewer = imageUrl => {
    setSelectedImage(`${process.env.APP_URL}${imageUrl}`);
    setImageViewerVisible(true);
  };

  const handleFilterPress = () => {
    setIsYearPickerVisible(true);
  };

  const handleYearChange = useCallback(
    selectedYear => {
      if (selectedYear !== tahun) {
        setTahun(selectedYear);
        setShouldRefresh(true);
      }
      setIsYearPickerVisible(false);
    },
    [tahun],
  );
  const { data: user } = useUser();
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const navigation = useNavigation();

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await axios.post(`/dashboard/${user.role.name}`, {
        tahun: tahun,
      });
      setDashboard(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [tahun, user.role.name]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const fetchUserData = useCallback(() => {
    setRefreshing(true);
    axios
      .post("/dashboard/" + user.role.name, { tahun: tahun })
      .then(response => {
        setDashboard(response.data);
      })
      .catch(error => {
        console.error("error fetching data dashboard ", error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [tahun, user.role.name]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const onRefresh = useCallback(() => {
    fetchUserData();
  }, [fetchUserData]);

  const Filtah = () => {
    return (
      <View className="">
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={handleFilterPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 10,
              backgroundColor: "white",
              shadowColor: "#000", // Warna bayangan
              shadowOffset: { width: 0, height: 2 }, // Posisi bayangan
              shadowOpacity: 0.25, // Opasitas bayangan
              shadowRadius: 3.84, // Radius bayangan
              elevation: 5, // Untuk Android
            }}
            className="px-3 py-2">
            <IonIcons name="calendar" size={24} color="black" />
            <Text className="text-black font-poppins-regular mx-2">
              {tahun}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <YearPicker
          visible={isYearPickerVisible}
          onClose={() => setIsYearPickerVisible(false)}
          onSelect={handleYearChange}
          selectedYear={tahun}
        />
      </View>
    );
  };

  const YearPicker = ({ visible, onClose, onSelect, selectedYear }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2021 },
      (_, i) => 2022 + i,
    );
    const [tempYear, setTempYear] = useState(selectedYear);

    useEffect(() => {
      if (visible) {
        setTempYear(selectedYear);
      }
    }, [visible]);

    const handleConfirm = () => {
      if (tempYear) {
        onSelect(tempYear);
      }
    };
    const canConfirm = tempYear;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tahun </Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View className=" ">
              <View className="flex-col items-center justify-center">
                <ScrollView className="max-h-64">
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      className={`mt-2 justify-center items-center ${
                        tempYear === year ? "bg-[#ececec] p-3 rounded-md" : ""
                      }`}
                      onPress={() => setTempYear(year)}>
                      <Text className="text-black font-poppins-semibold my-1">
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="mt-4 px-4">
              <TouchableOpacity
                className={`py-3 rounded-md ${
                  canConfirm ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!canConfirm}
                onPress={handleConfirm}>
                <Text className="text-white text-center font-poppins-semibold">
                  Terapkan Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        className="flex-col"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}>
        <ImageBackground
          source={require("../../../assets/images/background.png")}
          style={{
            flex: 1,
            height: "70%",
          }}>
          <Header
            navigate={() => {
              navigation.navigate("Profile");
            }}
          />

          {/* <View className="mr-8">
            <Filtah tahun={tahun} onYearChange={handleYearChange} />
          </View> */}

          <View className="items-center justify-center top-5">
            <Text className="text-white text-2xl items-center justify-center font-poppins-bold">
              Selamat Datang
            </Text>
          </View>

          <View className="min-h-[100px] relative shadow-lg bottom-1 z-10 mb-11">
            <View style={styles.welcomeCard}>
              {userData ? (
                <View className="flex-row items-center">
                  <FastImage
                    className="rounded-full"
                    style={{ width: 60, height: 60 }}
                    source={
                      userData?.photo
                        ? { uri: `${process.env.APP_URL}${userData.photo}` }
                        : DefaultAvatar
                    }
                    defaultSource={DefaultAvatar}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <View className="ml-3">
                    <Text className="font-poppins-semibold text-lg text-black">
                      {userData.nama}
                    </Text>
                    <Text className="font-poppins-regular text-sm text-gray-600">
                      {userData.email}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text className="font-poppins-regular text-sm text-gray-600 text-center">
                  Silakan login untuk mengakses data Anda.
                </Text>
              )}
            </View>
          </View>
        </ImageBackground>

        <View style={styles.welcomeCard} className="mt-44">
          <View className="flex-row items-center justify-center">
            <Text className="text-black text-sm font-poppins-regular">
              Pilih Tahun Data Dashboard :{" "}
            </Text>
            <TouchableOpacity
              className="flex-row p-3 bg-[#f8f8f8] rounded-lg"
              onPress={handleFilterPress}>
              <Text className="text-black font-poppins-regular">{tahun}</Text>
              <AntDesign
                name="caretdown"
                size={12}
                style={{ color: "black", marginLeft : 6, marginTop : 2}}
              />
            </TouchableOpacity>
          </View>
          <YearPicker
            visible={isYearPickerVisible}
            onClose={() => setIsYearPickerVisible(false)}
            onSelect={handleYearChange}
            selectedYear={tahun}
          />
        </View>

        <View className="mt-20">
          {user.has_tagihan && (
            <View style={styles.warningContainer}>
              <View style={styles.warningContent}>
                <FontAwesome6Icon
                  name="triangle-exclamation"
                  size={20}
                  color="#D97706"
                />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>
                    Tidak dapat membuat Permohonan Baru
                  </Text>
                  <Text style={styles.warningSubtitle}>
                    Harap selesaikan tagihan pembayaran Anda terlebih dahulu.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          // className="mt-2"
          showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardContainer} className="mb-8">
            {dashboard ? (
              <>
                <DashboardCard
                  number={dashboard.permohonanBaru}
                  text="Permohonan Baru"
                  icon="file-circle-plus"
                  iconColor="#6366F1"
                  gradientColors={["#EEF2FF", "#C7D2FE"]}
                />
                <DashboardCard
                  number={dashboard.permohonanDiproses}
                  text="Sedang Diproses"
                  icon="leaf"
                  iconColor="#EC4899"
                  gradientColors={["#FCE7F3", "#FBCFE8"]}
                />
                <DashboardCard
                  number={dashboard.permohonanSelesai}
                  text="Telah Selesai"
                  icon="clipboard-check"
                  iconColor="#10B981"
                  gradientColors={["#ECFDF5", "#A7F3D0"]}
                />
                <DashboardCard
                  className="mb-2"
                  number={dashboard.permohonanTotal}
                  text="Total Permohonan"
                  icon="chart-pie"
                  iconColor="#8B5CF6"
                  gradientColors={["#EDE9FE", "#DDD6FE"]}
                />
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
              </View>
            )}
          </View>
          <FooterText />
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const DashboardCard = ({
  style,
  number,
  text,
  icon,
  iconColor,
  gradientColors,
}) => (
  <View style={[styles.card, style]}>
    <View
      style={[styles.cardBackground, { backgroundColor: gradientColors[0] }]}>
      <View
        style={[styles.cardAccent, { backgroundColor: gradientColors[1] }]}
      />
    </View>
    <View style={styles.cardContent}>
      <View className="flex space-y-10">
        <View style={styles.iconContainer}>
          <FontAwesome6Icon name={icon} size={25} color={iconColor} />
        </View>
        <Text style={styles.cardText} className="font-poppins-semibold">
          {text}
        </Text>
      </View>
      <View style={styles.numberContainer}>
        <Text style={[styles.cardNumber, { color: iconColor }]}>{number}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    zIndex: 10,
    borderRadius: 12,
    width: "85%",
    top: 35,
    alignItems: "center",
    marginHorizontal: 31,
    position: "absolute",
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    elevation: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  headerTitle: {
    fontSize: 21,
    color: "#333",
    fontFamily: "Poppins-Bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  yearPickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  pickerWrapper: {
    flex: 1,
    maxWidth: 150,
  },
  pickerStyle: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    color: "#374151",
    fontSize: 16,
  },
  pickerIcon: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -12,
  },
  warningContainer: {
    padding: 16,
    marginTop: 16,
  },
  warningContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  warningTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
  },
  warningSubtitle: {
    fontSize: 13,
    color: "#92400E",
    opacity: 0.8,
  },
  dashboardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
  },
  card: {
    width: (windowWidth - 26) / 2.1,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardAccent: {
    position: "absolute",
    top: -130,
    right: -140,
    width: 220,
    height: 220,
    borderRadius: 200,
    opacity: 0.4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  upperContent: {
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    elevation: 2,
  },
  numberContainer: {
    position: "absolute",
    right: 24,
    top: 25,
    paddingHorizontal: 1,
    alignItems: "flex-end",
  },
  cardNumber: {
    bottom: 20,
    left: 10,
    fontSize: 33,
    fontFamily: "Poppins-SemiBold",
  },
  cardText: {
    fontSize: 20,
    color: "#4B5563",
    fontWeight: "500",
    top: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  yearSelectorContainer: {
    zIndex: 10,
    marginHorizontal: 35,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    position: "absolute",
    top: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
    width: "80%",
  },
  yearLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    left: 6,
  },
  yearText: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#6B7280",
    marginTop: 5,
  },
  pickerContainer: {
    flex: 1,
    maxWidth: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  yearList: {
    paddingVertical: 8,
  },
  yearItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedYear: {
    backgroundColor: "#f8f8f8",
    fontFamily: "Poppins-Regular",
  },
  yearText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#000",
    textAlign: "center",
  },
  selectedYearText: {
    color: "#000",
    fontFamily: "Poppins-Regular",
  },
});

export default Dashboard;
