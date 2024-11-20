import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { rupiah } from "@/src/libs/utils";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";
import { useDownloadPDF } from "@/src/hooks/useDownloadPDF";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../../components/Back";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import IonIcons from "react-native-vector-icons/Ionicons";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const PaginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [type, setType] = useState("va");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);

  const bulans = [
    { id: 1, text: "Januari" },
    { id: 2, text: "Februari" },
    { id: 3, text: "Maret" },
    { id: 4, text: "April" },
    { id: 5, text: "Mei" },
    { id: 6, text: "Juni" },
    { id: 7, text: "Juli" },
    { id: 8, text: "Agustus" },
    { id: 9, text: "September" },
    { id: 10, text: "Oktober" },
    { id: 11, text: "November" },
    { id: 12, text: "Desember" },
  ];

  const types = [
    { id: "va", text: "VA" },
    { id: "qris", text: "QRIS" },
  ];

  const handleDateSelect = (selectedYear, selectedMonth) => {
    setTahun(selectedYear);
    setBulan(selectedMonth);
    setRefreshKey(prevKey => prevKey + 1);
    setIsDatePickerVisible(false);
  };

  const handleTypeSelect = selectedType => {
    setType(selectedType);
    setRefreshKey(prevKey => prevKey + 1);
    setIsTypePickerVisible(false);
  };

  const handleDatePickerPress = () => {
    setIsDatePickerVisible(true);
  };

  const handleTypePickerPress = () => {
    setIsTypePickerVisible(true);
  };

  const { download, PDFConfirmationModal } = useDownloadPDF({
    onSuccess: filePath => console.log("Download success:", filePath),
    onError: error => console.error("Download error:", error),
  });

  const CardPembayaran = ({ item }) => {
    const isExpired = item.payment?.is_expired;
    const status = item.payment?.status;

    const dropdownOptions = [
      // Opsi Pembayaran
      (isExpired || status === "pending" || status === "failed") && {
        id: "Pembayaran",
        title: "Pembayaran",
        action: () =>
          navigation.navigate("PengujianDetail", { uuid: item.uuid }),
      },

      // Opsi Tagihan
      (status === "pending" || status === "failed") && {
        id: "Tagihan",
        title: "Tagihan",
        action: async () => {
          try {
            const token = await AsyncStorage.getItem("@auth-token");
            if (token) {
              const reportUrl = `${API_URL}/report/${item.uuid}/tagihan-pembayaran?token=${token}`;
              download(reportUrl); // Menampilkan modal preview
            } else {
              console.error("Token not found");
            }
          } catch (error) {
            console.error("Error mendapatkan token:", error);
          }
        },
      },

      // Opsi Detail
      status === "success" && {
        id: "Detail",
        title: "Detail",
        action: () =>
          navigation.navigate("PengujianDetail", { uuid: item.uuid }),
      },

      // Opsi Cetak
      status === "success" && {
        id: "Cetak",
        title: "Cetak",
        action: async () => {
          try {
            const token = await AsyncStorage.getItem("@auth-token");
            if (token) {
              const reportUrl = `${API_URL}/report/${item.uuid}/bukti-pembayaran?token=${token}`;
              download(reportUrl); // Menampilkan modal preview
            } else {
              console.error("Token not found");
            }
          } catch (error) {
            console.error("Error fetching token:", error);
          }
        },
      },
    ].filter(Boolean);

    if (dropdownOptions.length === 0) {
      dropdownOptions.push({
        id: "Pembayaran",
        title: "Pembayaran",
        action: () =>
          navigation.navigate("PengujianDetail", { uuid: item.uuid }),
      });
    }

    const getStatusText = item => {
      if (item.payment?.is_expired) {
        return "Kedaluwarsa";
      } else {
        const status = item.payment?.status;
        if (status === "pending") {
          return "Belum Dibayar";
        } else if (status === "success") {
          return "Berhasil";
        } else {
          return "Gagal";
        }
      }
    };

    const getStatusStyle = item => {
      if (item.payment?.is_expired) {
        return " text-red-500";
      } else {
        const status = item.payment?.status;
        if (status === "pending") {
          return " text-blue-400";
        } else if (status === "success") {
          return "text-green-500";
        } else {
          return " text-red-500";
        }
      }
    };

    const statusText = getStatusText(item);
    const statusStyle = getStatusStyle(item);

    // console.log("item: ", item);

    return (
      <View style={styles.card}>
        <View style={styles.roundedBackground} className="rounded-br-full" />

        <View style={styles.cardWrapper}>
          {/* Left section with rounded background */}
          <View style={styles.leftSection}>
            <View style={styles.cardContent}>
              <Text className="font-poppins-semibold text-slate-600 text-xs uppercase">
                Kode
              </Text>
              <Text className="text-black font-poppins-regular text-base">
                {item.kode}
              </Text>
              <Text className="font-poppins-semibold  text-slate-600 mt-3 text-xs uppercase">
                Lokasi
              </Text>
              <Text className="text-black font-poppins-regular text-base">
                {item.lokasi}
              </Text>
            </View>
          </View>

          {/* Middle section */}
          <View style={styles.cardContents} className="flex flex-end ">
            <Text className="font-poppins-semibold text-slate-600 text-xs uppercase">
              Status
            </Text>
            <Text
              style={[styles[statusStyle]]}
              className={` ${getStatusStyle(
                item,
              )} font-poppins-regular text-base`}>
              {statusText}
            </Text>

            <Text className="font-poppins-semibold text-slate-600 mt-3 text-xs uppercase">
              Tipe
            </Text>
            <Text
              style={[styles[statusStyle]]}
              className={`  text-black uppercase font-poppins-regular text-base`}>
              {item.payment_type}
            </Text>

            <Text className="text-slate-600 text-xs mt-3 uppercase font-poppins-semibold">
              Harga
            </Text>
            <Text className="text-black mb-4 font-poppins-regular">
              {rupiah(item.harga)}
            </Text>
          </View>

          {/* Right section (dots menu) */}
          <View style={styles.cardActions} className="mb-4 ">
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
                <Entypo name="dots-three-vertical" size={16} color="#312e81" />
              </View>
            </MenuView>
          </View>
        </View>
      </View>
    );
  };

  const filtah = () => {
    return (
      <View className="flex-row justify-end gap-2 ">
        <TouchableOpacity
          onPress={handleTypePickerPress}
          className="flex-row items-center bg-[#ececec] px-2 py-3 rounded-md">
          <IonIcons name="card" size={24} color="black" />
          <Text className="text-black font-poppins-regular  mx-2">
            {types.find(t => t.id === type)?.text}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDatePickerPress}
          className="flex-row items-center bg-[#ececec] px-2 py-1    rounded-md">
          <IonIcons name="calendar" size={24} color="black" />
          <View className="flex-col items-center">
            <Text className="text-black font-poppins-regular  mx-2">
              {bulans[bulan - 1]?.text}
            </Text>

            <Text className="text-black font-poppins-regular  mx-2">
              {tahun}
            </Text>
          </View>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
        </TouchableOpacity>
      </View>
    );
  };

  const DatePicker = ({
    visible,
    onClose,
    onSelect,
    selectedYear,
    selectedMonth,
  }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2021 },
      (_, i) => 2022 + i,
    );
    const [tempYear, setTempYear] = useState(selectedYear);
    const [tempMonth, setTempMonth] = useState(selectedMonth);

    useEffect(() => {
      if (visible) {
        setTempYear(selectedYear);
        setTempMonth(selectedMonth);
      }
    }, [visible]);

    const handleConfirm = () => {
      if (tempYear && tempMonth) {
        onSelect(tempYear, tempMonth);
      }
    };
    const canConfirm = tempYear && tempMonth;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tahun dan Bulan</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View className="flex-row ">
              <View className="w-1/2 flex-col items-center">
                <Text className="text-black font-poppins-semibold text-base">
                  Tahun
                </Text>
                <ScrollView className="max-h-64">
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      className={`mt-2 justify-center items-center ${
                        tempYear === year ? "bg-[#ececec] p-3 rounded-md" : ""
                      }`}
                      onPress={() => setTempYear(year)}>
                      <Text className="text-black font-poppins-regular">
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View className="w-1/2 flex-col items-center">
                <Text
                  style={styles.sectionTitle}
                  className="text-black font-poppins-semibold text-base">
                  Bulan
                </Text>
                <ScrollView className="max-h-64">
                  {bulans.map(month => (
                    <TouchableOpacity
                      key={month.id}
                      className={`mt-2 justify-center items-center ${
                        tempMonth === month.id
                          ? "bg-[#ececec] p-3 rounded-md"
                          : ""
                      }`}
                      onPress={() => setTempMonth(month.id)}>
                      <Text className="text-black font-poppins-regular">
                        {month.text}
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

  const TypePicker = ({ visible, onClose, onSelect, selectedType }) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tipe Pembayaran</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.yearList} className="">
              {types.map(item => (
                <TouchableOpacity
                  className={`mt-2 items-center ${
                    selectedType === item.id
                      ? "bg-[#ececec] p-3 rounded-md"
                      : ""
                  }`}
                  key={item.id}
                  onPress={() => onSelect(item.id)}>
                  <Text className="text-black font-poppins-regular">
                    {item.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <View className="p-3 bg-[#ececec] w-full h-full">
        <View className="rounded-3xl bg-[#f8f8f8]">
          <View className="flex-row  p-3 justify-between">
            <BackButton
              size={24}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-2 "
            />
            <Text className="font-poppins-semibold text-black text-lg ">
              Pengujian Pembayaran
            </Text>
          </View>
          <View className=" w-full h-full bg-[#f8f8f8] ">
            <Paginate
              key={refreshKey}
              className="mb-20"
              url="/pembayaran/pengujian"
              Plugin={filtah}
              payload={{ tahun, bulan, type }}
              renderItem={CardPembayaran}
              ref={PaginateRef}></Paginate>
          </View>
        </View>

        <DatePicker
          visible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
          onSelect={handleDateSelect}
          selectedYear={tahun}
          selectedMonth={bulan}
        />
        <TypePicker
          visible={isTypePickerVisible}
          onClose={() => setIsTypePickerVisible(false)}
          onSelect={handleTypeSelect}
          selectedType={type}
        />
        <PDFConfirmationModal />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
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
    paddingTop: 12,
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
    fontWeight: "bold",
  },

  cardTexts: {
    fontSize: rem(0.9),
    color: "black",
  },
  pending: {
    color: "white",
    backgroundColor: "green",
    paddingVertical: 5,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  picker: {
    flex: 1,
    color: "black",
    marginHorizontal: 4,
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
export default Pengujian;
