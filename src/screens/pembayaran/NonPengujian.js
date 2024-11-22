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
const NonPengujian = ({ navigation }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(2024);
  const [type, setType] = useState("va");

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

  const types = [
    { id: "va", text: "VA" },
    { id: " qris", text: "QRIS" },
  ];

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleTypeChange = useCallback(itemValue => {
    setType(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  });

  const cardNonPengujian = ({ item }) => {
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

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <View className="flex flex-row justify-between bg-[#fff]">
        <TouchableOpacity className="bg-red-500 p-2 w-1/2 rounded-lg">
          <Text className="text-white font-bold font-sans text-center">
            Laporan
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-indigo-500 p-2 w-1/2 rounded-lg"
          onPress={() => navigation.navigate("FormNonPengujian")}>
          <Text className="text-white font-bold font-sans text-center">
            Buat +
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row  justify-between items-center">
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
          onValueChange={handleYearChange}
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
          }}
        />
      </View>

      <Paginate
        ref={paginateRef}
        key={refreshKey}
        url="/pembayaran/non-pengujian"
        payload={{ tahun, type }}
        renderItem={cardNonPengujian}></Paginate>
    </View>
  );
};

export default NonPengujian;

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
