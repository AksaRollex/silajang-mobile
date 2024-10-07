import { View, Text, StyleSheet } from "react-native";
import { Colors } from "react-native-ui-lib";
import React, { useRef, useState, useCallback, useEffect } from "react";
import Header from "../../components/Header";
import { rupiah } from "@/src/libs/utils";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";
import { useDownloadPDF } from "@/src/hooks/useDownloadPDF";
import { Picker } from "@react-native-picker/picker";
import BackButton from "../../components/Back";

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

  const type = "va";
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
    console.log(item);
      !!item.multi_payment?.id && item.multi_payment?.status !== "success";

    const dropdownOptions = [
      {
        id: "Pembayaran",
        title: item.status === "success" ? "Detail" : "Pembayaran",
        action: () =>
          navigation.navigate("MultipaymentDetail", { uuid: item.uuid }),
      },
      {
        id: "Tagihan",
        title: item.status === "success" ? "Cetak" : "Tagihan",
        action: () =>
          navigation.navigate("MultipaymentDetail", { uuid: item.uuid }),
      },
    ].filter(Boolean);

    const getStatusText = () => {
      if (item?.is_expired) {
        return "Kedaluwarsa";
      } else {
        const status = item?.status;
        if (status === "pending") {
          return "Menunggu";
        } else if (status === "success") {
          return "Berhasil";
        } else {
          return "Gagal";
        }
      }
    };

    const getStatusStyle = () => {
      if (item?.is_expired) {
        return className="bg-slate-100 text-red-500";
      } else {
        const status = item?.status;
        if (status === "pending") {
          return className="bg-slate-100 text-indigo-600";
        } else if (status === "success") {
          return className="bg-slate-100 text-green-500";
        } else {
          return className="bg-slate-100 text-red-500";
        }
      }
    };

    const statusText = getStatusText(item);
    const statusStyle = getStatusStyle(item);

    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <View className="flex-row gap-1">
            <Text
              style={[styles.badge, styles[statusStyle]]}
              className={` bg-slate-100 ${getStatusStyle(item)}`}>
              {statusText}
            </Text>
            <Text
              className="bg-slate-100 text-indigo-600"
              style={[styles.badge, { textTransform: "uppercase" }]}>
              {item.type}
            </Text>
          </View>

          <Text style={[styles.cardTexts, { fontSize: 15 }]}>
            {item.multi_payments
              ?.map(payment => payment.titik_permohonan.lokasi)
              .join(", ") || "Lokasi Kosong"}
          </Text>
          <Text
            style={[styles.cardTexts, { fontWeight: "bold", fontSize: 19 }]}>
            {item.multi_payments
              ?.map(payment => payment.titik_permohonan.kode)
              .join(", ")}
          </Text>
          <Text style={[styles.cardTexts]}>{rupiah(item.jumlah)}</Text>
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
      <View className="w-full">
        <View
          className="flex-row mb-4 p-4 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <BackButton
            size={24}
            color="white"
            action={() => navigation.goBack()}
          />
          <Text className="font-bold text-white text-lg">Multipayment</Text>
        </View>
      </View>
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
          url="/pembayaran/multi-payment"
          payload={{ tahun, bulan, type }}
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
});
export default Pengujian;
