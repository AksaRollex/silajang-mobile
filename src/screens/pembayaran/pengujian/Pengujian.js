import { View, Text, StyleSheet } from "react-native";
import { Colors } from "react-native-ui-lib";
import React, { useRef, useState, useCallback } from "react";
import Header from "../../components/Header";
import { rupiah } from "@/src/libs/utils";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";
import { useDownloadPDF } from "@/src/hooks/index";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "@env"

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const PaginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [refreshKey, setRefreshKey] = useState(0);

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

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

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleMonthChange = useCallback(itemValue => {
    setRefreshKey(prevKey => prevKey + 1);
    setBulan(itemValue);
  }, []);

  const { download, PDFConfirmationModal } = useDownloadPDF({
    onSuccess: filePath => console.log("Download success:", filePath),
    onError: error => console.error("Download error:", error),
  });

  const CardPembayaran = ({ item }) => {
    const isExpired = item.payment?.is_expired;
    const shouldShowTagihan =
      !!item.payment?.id && item.payment?.status !== "success";

    const dropdownOptions = [
      {
        id: "Pembayaran",
        title: "Pembayaran",
        action: item =>
          navigation.navigate("PaymentDetail", { uuid: item.uuid }),
      },
      shouldShowTagihan && {
        id: "Tagihan",
        title: "Tagihan",
        action: () => download(`${API_URL}/report/pembayaran/pengujian?tahun=${tahun}`),
      },
    ].filter(Boolean);

    const statusText = isExpired ? "Kedaluwarsa" : item.text_status_pembayaran;

    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <View className="p-1 my-2 flex-start bg-slate-200 rounded-md">
            <Text className="text-xs text-indigo-600">{statusText}</Text>
          </View>
          <Text style={[styles.cardTexts, { fontSize: 15 }]}>
            {item.lokasi}
          </Text>
          <Text
            style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
            {item.kode}
          </Text>
          <Text style={[styles.cardTexts]}>{rupiah(item.harga)}</Text>
        </View>
        <View style={styles.cards2}>
          <View>
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

  return (
    <>
      <Header />
      <View className=" w-full h-full bg-[#ececec] ">
        <View className="p-4 ">
          <View className="flex flex-row justify-between bg-[#fff]">
            <Picker
              selectedValue={tahun}
              style={styles.picker}
              onValueChange={handleYearChange}>
              {tahuns.map(item => (
                <Picker.Item key={item.id} label={item.text} value={item.id} />
              ))}
            </Picker>
            <Picker
              selectedValue={bulan}
              style={styles.picker}
              onValueChange={handleMonthChange}>
              {bulans.map(item => (
                <Picker.Item key={item.id} label={item.text} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>
        <Paginate
          key={refreshKey}
          className="mb-28"
          url="/pembayaran/pengujian"
          payload={{ tahun, bulan }}
          renderItem={CardPembayaran}
          ref={PaginateRef}></Paginate>
      </View>
      <PDFConfirmationModal />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 15,
    padding: rem(0.7),
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
  },
  cards: {
    borderRadius: 10,
    width: "70%",
    marginBottom: 4,
  },
  cards2: {
    borderRadius: 10,
    width: "30%",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    marginHorizontal: 4,
  },
});
export default Pengujian;
