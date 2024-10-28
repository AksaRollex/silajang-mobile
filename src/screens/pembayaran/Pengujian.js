import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRef } from "react";
import Paginate from "../components/Paginate";
import { Colors } from "react-native-ui-lib";
import RNPickerSelect from "react-native-picker-select";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { MenuView } from "@react-native-menu/menu";
import { rupiah } from "@/src/libs/utils";
import Entypo from "react-native-vector-icons/Entypo";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(2024);
  const [bulan, setBulan] = useState(10);

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
    setBulan(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const cardPengujian = ({ item }) => {
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

    const dropdownOptions = [
      {
        id: "Edit",
        title: "Edit",
        action: item =>
          navigation.navigate("FormPengujian", { uuid: item.uuid }),
      },
    ];

    console.log(item);
    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <Text
            style={[styles.badge, styles[statusStyle]]}
            className={` bg-slate-100 ${getStatusStyle(item)}`}>
            {statusText}
          </Text>
          <Text className="font-bold text-xl text-black my-1">
            {item?.permohonan?.user?.nama}
          </Text>
          <Text
            style={[styles.badge]}
            className="bg-indigo-400 text-white text-xs">
            {item.kode}
          </Text>
          <Text className="text-black text-xs font-bold">{item.lokasi}</Text>
          <Text>{rupiah(item.harga)}</Text>
          <Text>{item.tanggal_bayar}</Text>
        </View>
        <View style={styles.cards2}>
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
    );
  };

  const massReport = () => {
    if (this.previewRaport) {
      this.reportUrl = `/pembayaran/pengujian?tahun=${this.tahun}&bulan=${
        this.bulan
      }&token=${localStorage.getItem("auth_token")}`;
    } else {
      this.reportUrl = `/pembayaran/non-pengujian?tahun=${this.tahun}`;
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <TouchableOpacity
        className="bg-red-500 p-2 w-3/12 rounded-lg"
        onPress={massReport}>
        <Text className="text-white font-bold font-sans text-center">
          Laporan
        </Text>
      </TouchableOpacity>
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
        }}
      />

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
      <Paginate
        ref={paginateRef}
        key={refreshKey}
        url="/pembayaran/pengujian"
        payload={{ tahun, bulan }}
        renderItem={cardPengujian}></Paginate>
    </View>
  );
};

export default Pengujian;

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: rem(0.7),
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
    marginVertical: 10,
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

  cardTexts: {
    fontSize: rem(0.9),
    color: "black",
  },

  badge: {
    alignSelf: "flex-start",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
});
