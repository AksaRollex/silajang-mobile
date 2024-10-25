import { View, Text, StyleSheet } from "react-native";
import { Colors } from "react-native-ui-lib";
import React, { useRef, useState, useCallback } from "react";
import { rupiah } from "@/src/libs/utils";
import RNPickerSelect from "react-native-picker-select";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";
import { useDownloadPDF } from "@/src/hooks/useDownloadPDF";
import { Picker } from "@react-native-picker/picker";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../../components/Back";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const PaginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [type, setTypes] = useState("va");
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

  const types = [
    { id: "va", text: "VA" },
    { id: "qris", text: "QRIS" },
  ];

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleMonthChange = useCallback(itemValue => {
    setRefreshKey(prevKey => prevKey + 1);
    setBulan(itemValue);
  }, []);

  const handleTypeChange = useCallback(itemValue => {
    setRefreshKey(prevKey => prevKey + 1);
    setTypes(itemValue);
  });
  const { download, PDFConfirmationModal } = useDownloadPDF({
    onSuccess: filePath => console.log("Download success:", filePath),
    onError: error => console.error("Download error:", error),
  });

  const CardPembayaran = ({ item }) => {
    console.log("item:", item);
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

    console.log("item: ", item);

    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <View style={{ flexDirection: "row" }}>
            <Text
              style={[styles.badge, styles[statusStyle]]}
              className={` bg-slate-100 ${getStatusStyle(item)}`}>
              {statusText}
            </Text>
            <Text
              style={[styles.badge, styles[statusStyle]]}
              className={` bg-slate-100 text-black mx-2`}>
              {item.payment_type}
            </Text>
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

  const filtah = () => {
    return (
      <View className="py-2 ">
        <View className="flex flex-row justify-between bg-[#fff]">
          <RNPickerSelect
            onValueChange={handleYearChange}
            items={tahuns.map(item => ({ label: item.text, value: item.id }))}
            value={tahun}
            style={{
              inputIOS: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
              inputAndroid: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
            }}
            Icon={() => {
              return (
                <MaterialIcons
                  style={{ marginTop: 16, marginRight: 12 }}
                  name="keyboard-arrow-down"
                  size={24}
                  color="black"
                />
              );
            }}
            placeholder={{
              label: "Pilih Tahun",
              value: null,
              color: "grey",
            }}></RNPickerSelect>
          <RNPickerSelect
            items={bulans.map(item => ({ label: item.text, value: item.id }))}
            value={bulan}
            style={{
              inputIOS: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
              inputAndroid: {
                paddingHorizontal: rem(5),
                borderWidth: 3,
                color: "black",
              },
            }}
            onValueChange={handleMonthChange}
            Icon={() => {
              return (
                <MaterialIcons
                  style={{ marginTop: 16, marginRight: 12 }}
                  name="keyboard-arrow-down"
                  size={24}
                  color="black"
                />
              );
            }}
            placeholder={{
              label: "Pilih Bulan",
              value: null,
              color: "grey",
            }}></RNPickerSelect>
          <RNPickerSelect
            items={types.map(item => ({ label: item.text, value: item.id }))}
            value={type}
            style={{
              inputIOS: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
              inputAndroid: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
            }}
            onValueChange={handleTypeChange}
            Icon={() => {
              return (
                <MaterialIcons
                  style={{ marginTop: 16, marginRight: 12 }}
                  name="keyboard-arrow-down"
                  size={24}
                  color="black"
                />
              );
            }}
            placeholder={{
              label: "Pilih Tipe",
              value: null,
              color: "grey",
            }}></RNPickerSelect>
        </View>
      </View>
    );
  };
  return (
    <>
      <View className="w-full">
        <View
          className="flex-row  p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <BackButton
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className="font-bold text-white text-lg ">
            Pengujian Pembayaran
          </Text>
        </View>
      </View>
      <View className=" w-full h-full bg-[#ececec] ">
        <Paginate
          key={refreshKey}
          className="mb-20"
          url="/pembayaran/pengujian"
          Plugin={filtah}
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
    width: "90%",
    marginBottom: 4,
  },
  cards2: {
    borderRadius: 10,
    width: "10%",
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
