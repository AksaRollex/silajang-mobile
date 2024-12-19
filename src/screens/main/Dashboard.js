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
import { useNavigation } from "@react-navigation/native";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import IonIcons from "react-native-vector-icons/Ionicons";
const windowWidth = Dimensions.get("window").width;
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tahun, setTahun] = useState(new Date().getFullYear());
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

  const handleYearChange = selectedYear => {
    setTahun(selectedYear);
  };
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

  const Filtah = ({ tahun, onYearChange }) => {
    const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);

    const handleFilterPress = () => {
      setIsYearPickerVisible(true);
    };

    const handleYearSelect = selectedYear => {
      onYearChange(selectedYear);
      setIsYearPickerVisible(false);
    };

    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
      }, 2000);
    }, []);

    return (
      <>
        <View className="px-4 py-2 w-full mt-2">
          <View
            className="bg-[#fff] rounded-lg border border-gray-200"
            style={{ elevation: 8 }}>
            <ScrollView
              contentContainerStyle={{
                padding: 16,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }>
              <View className="flex-row gap-2 items-center">
                <IonIcons name="calendar" size={27} color={"#4d5b7a"} />
                <Text
                  className="text-lg text-gray-600 font-poppins-bold"
                  style={{ top: 3 }}>
                  Tahun
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleFilterPress}
                className="flex-row items-center justify-between border border-gray-300 bg-gray-50 p-3 rounded-lg">
                <View className="flex-row items-center">
                  <Text className="text-gray-700 font-poppins-semibold text-base ">
                    {tahun}
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={24}
                    color={"#4d5b7a"}
                  />
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <YearPicker
            visible={isYearPickerVisible}
            onClose={() => setIsYearPickerVisible(false)}
            onSelect={handleYearSelect}
            selectedYear={tahun}
          />
        </View>
      </>
    );
  };
  const YearPicker = ({ visible, onClose, onSelect, selectedYear }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2021 },
      (_, i) => 2022 + i,
    );

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tahun</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.yearList}>
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearItem,
                    selectedYear === year && styles.selectedYear,
                  ]}
                  onPress={() => {
                    onSelect(year);
                    onClose();
                  }}>
                  <Text
                    style={[
                      styles.yearText,
                      selectedYear === year && styles.selectedYearText,
                    ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
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
            height: "34%", // Pastikan gambar menutupi area yang diinginkan
            // borderBottomLeftRadius: 20,
            // borderBottomRightRadius: 20,
          }}>
          <Header
            navigate={() => {
              navigation.navigate("Profile");
            }}
          />
          <Filtah tahun={tahun} onYearChange={handleYearChange} />
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
        </ImageBackground>

        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.dashboardContainer}>
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
          {/* <FooterText /> */}
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
  // yearLabel: {
  //   fontSize: 16,
  //   fontWeight: "600",
  //   color: "#374151",
  //   marginRight: 15,
  // },
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
    padding: 12,
    gap: 20,
  },
  card: {
    width: (windowWidth - 26) / 1,
    height: 150,
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
    top: -100,
    right: -100,
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
    fontSize: 33,
    fontFamily: "Poppins-SemiBold",
  },
  cardText: {
    fontSize: 20,
    color: "#4B5563",
    fontWeight: "500",
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
