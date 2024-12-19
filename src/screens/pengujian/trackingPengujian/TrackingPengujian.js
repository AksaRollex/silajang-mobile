import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import Paginate from "../../components/Paginate";
import Back from "../../components/Back";
import IonIcons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const TrackingPengujian = ({ navigation }) => {
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

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

  const renderItem = ({ item }) => (
    console.log(item),
    (
      <View style={styles.card}>
        <View style={styles.roundedBackground} className="rounded-br-full" />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("TrackingList", { selected: item })
          }
          style={styles.cardWrapper}>
          {/* Left section with rounded background */}
          <View style={styles.leftSection}>
            <View style={styles.cardContent}>
              <Text className="font-poppins-semibold text-slate-600 text-xs uppercase">
                Kode
              </Text>
              <Text className=" font-poppins-regular text-black  text-base">
                {item.kode}
              </Text>
              <Text className=" font-poppins-semibold text-slate-600 mt-3 text-xs uppercase">
                Lokasi
              </Text>
              <Text className="text-black font-poppins-regular text-base">
                {item.lokasi}
              </Text>
              <Text className="text-slate-600 text-xs font-poppins-semibold mt-3 uppercase ">
                Status
              </Text>
              <Text className="text-indigo-600 font-poppins-regular ">
                {item.text_status}
              </Text>
            </View>
          </View>

          {/* Middle section */}
          <View style={styles.cardContents}>
            <Text className=" uppercase text-xs text-slate-600 font-poppins-semibold">
              Tanggal Diterima
            </Text>
            <Text className=" text-base text-black font-poppins-regular">
              {item.tanggal_diterima || "Tanggal Belum Tersedia"}
            </Text>
            <Text className=" text-slate-600 mt-3 text-xs uppercase font-poppins-semibold">
              Tanggal Selesai
            </Text>
            <Text className=" text-base text-black font-poppins-regular">
              {item.tanggal_selesai || "Tanggal Belum Tersedia"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  );

  const filtah = () => {
    return (
      <>
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={handleFilterPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 4,
              backgroundColor: "#ececec",
            }}
            className="px-2 py-3">
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
      </>
    );
  };

  useEffect(() => {
    console.log("Tahun berubah:", tahun);
  }, [tahun]);

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
    <>
      <View className="w-full h-full bg-[#ececec] p-3">
        <View className="rounded-3xl bg-[#fff] w-full h-full">
          <View className="flex-row p-3 justify-between">
            <Back
              size={24}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-2 "
            />
            <Text className="font-poppins-semibold text-black text-lg ">
              Tracking Pengujian
            </Text>
          </View>
          <View className="w-full h-full">
            <Paginate
              key={refreshKey}
              url="/tracking"
              className="mb-20"
              Plugin={filtah}
              ref={paginateRef}
              payload={{ tahun: tahun }}
              renderItem={renderItem}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
    color: "black",
  },
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    marginVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    overflow: "hidden",
    position: "relative", // Added to position the background
  },
  roundedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%", // Adjust this value to control how much of the card is covered
    backgroundColor: "#e2e8f0", // slate-200 equivalent
  },
  cardWrapper: {
    flexDirection: "row",
    position: "relative",
    zIndex: 1,
  },
  leftSection: {
    width: "45%",
    position: "relative",
  },
  cardContent: {
    padding: 12,
  },
  cardContents: {
    width: "45%",
    padding: 12,
  },
  cardActions: {
    width: "10%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
    fontSize: 12,
  },
  lokasi: {
    fontSize: 14,
    marginBottom: 4,
  },
  kode: {
    fontSize: 22,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
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

export default TrackingPengujian;
