import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import Header from "../components/Header";
import FooterText from "../components/FooterText";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/AntDesign";
import RNPickerSelect from "react-native-picker-select";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";

const windowWidth = Dimensions.get("window").width;
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahuns, setTahuns] = useState([]);
  const { data: user } = useUser();
  const navigation = useNavigation();

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

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2021 }, (_, i) => ({
      id: currentYear - i,
      text: `${currentYear - i}`,
    }));
    setTahuns(years);
  }, []);

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
  }, []);

  const onRefresh = useCallback(() => {
    fetchUserData();
  }, [fetchUserData]);

  const YearSelector = ({ value, onValueChange, items }) => (
    <View style={styles.yearSelectorContainer}>
      <View style={styles.yearLabel}>
        <FontAwesome6Icon name="calendar-week" size={24} color="#312e81" />
        <Text style={styles.yearText}>Tahun</Text>
      </View>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={onValueChange}
          items={items}
          value={value}
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false}
          Icon={() => (
            <MaterialIcons
              name="keyboard-arrow-down"
              size={25}
              color="#6B7280"
              style={{ marginTop: 10, marginRight: 12 }}
            />
          )}
          placeholder={{
            label: "Pilih Tahun",
            value: null,
            color: "#9CA3AF",
          }}
        />
      </View>
    </View>
  );

  const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 17,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 8,
      color: "#4B5563",
      fontFamily: "Poppins-SemiBold",
      textAlign: "center",
    },
    inputAndroid: {
      fontSize: 17,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 8,
      color: "#4B5563",
      fontFamily: "Poppins-SemiBold",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
    <ScrollView
      className="flex-col"
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[]}>
        
      <Header
        navigate={() => {
          navigation.navigate("Profile");
        }}
        />

      <View className="min-h-[100px] relative shadow-lg z-10 mb-10" style={{ backgroundColor : Colors.brand }}>
        <View className="px-4 pt-4">
          <Text className="text-2xl text-center font-poppins-semibold text-white mb-1">Dashboard</Text>
          </View>
      <YearSelector
        value={tahun}
        onValueChange={handleYearChange}
        items={tahuns.map(item => ({ label: item.text, value: item.id }))}
        />
      </View>

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

      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.dashboardContainer}>
          {dashboard ? (
            <>
              <DashboardCard
                style={styles.cardNew}
                number={dashboard.permohonanBaru}
                text="Permohonan Baru"
                icon="file-circle-plus"
                iconColor="#6366F1"
                gradientColors={["#EEF2FF", "#C7D2FE"]}
              />
              <DashboardCard
                style={styles.cardProcess}
                number={dashboard.permohonanDiproses}
                text="Sedang Diproses"
                icon="leaf"
                iconColor="#EC4899"
                gradientColors={["#FCE7F3", "#FBCFE8"]}
                />
              <DashboardCard
                style={styles.cardCompleted}
                number={dashboard.permohonanSelesai}
                text="Telah Selesai"
                icon="clipboard-check"
                iconColor="#10B981"
                gradientColors={["#ECFDF5", "#A7F3D0"]}
                />
              <DashboardCard
                style={styles.cardTotal}
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
    width: (windowWidth - 36) / 1,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    position: 'absolute',
    top: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
    width: '80%',
  },
  yearLabel: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default Dashboard;
