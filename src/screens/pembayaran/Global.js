import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Modal } from "react-native";
import { useRef } from "react";
import Paginate from "../components/Paginate";
import { Colors } from "react-native-ui-lib";
import RNPickerSelect from "react-native-picker-select";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { rupiah } from "@/src/libs/utils";
import { API_URL } from "@env";
import Pdf from "react-native-pdf";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useDownloadPDF } from "@/src/hooks/useDownloadPDF";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Global = ({ navigation, isExpired }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();
  const [reportUrl, setReportUrl] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [tahun, setTahun] = useState(2024);
  const [status, setStatus] = useState();

  const { Save: savePDF, SaveConfirmationModal } = useDownloadPDF({
    onSuccess: response => {
      Toast.show({
        type: "success",
        text1: "PDF Berhasil Disimpan",
        text1Style: { color: "green" },
      });
    },
    onError: error => {
      Toast.show({
        type: "error",
        text1: "PDF Gagal Disimpan",
        text1Style: { color: "red" },
      });
    },
  });

  const handleSave = () => {
    const url = `${API_URL}/pembayaran/global/report?tahun=${tahun}&status=${status}`;
    savePDF(url);
  };

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

  const statuses = [
    { id: "-", text: "Semua" },
    { id: "pending", text: "Pending" },
    { id: "success", text: "Sukses" },
    { id: "failed", text: "Gagal" },
  ];

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleStatusChange = useCallback(itemValue => {
    setStatus(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const cardGlobal = ({ item }) => {
    const getStatusText = item => {
      if (item?.is_expired) {
        return "Kedaluwarsa";
      } else {
        const status = item?.status;
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
      if (item?.is_expired) {
        return " text-red-500";
      } else {
        const status = item?.status;
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
    const isExpired = item?.is_expired;
    console.log(item);
    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <View className="flex-row justify-between items-start">
            <View>
            <Text className="text-xs font-poppins-regular text-gray-500">Virtual Account</Text>
            <Text className=" text-indigo-600 text-md font-poppins-semibold mb-2">
              {item.va_number || "Nomor VA Kosong"}
            </Text>
            </View>
            <Text
              style={[styles.badge, styles[statusStyle]]}
              className={`bg-slate-100 px-2 py-1 size-[10px] ${getStatusStyle(item)}`}>
              {statusText}
            </Text>
          </View>
          <Text className="text-xs font-poppins-regular text-gray-500">Nama</Text>
          <Text className="text-md font-poppins-semibold text-black mb-2">
            {item?.nama || "-"}
          </Text>
          <Text className="text-xs font-poppins-regular text-gray-500">Jumlah Nominal</Text>
          <Text className="text-md font-poppins-semibold text-black mb-2">
            {rupiah(item.jumlah)}
          </Text>
          <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Dibuat</Text>
          <Text className="text-md font-poppins-semibold text-black mb-2">
            {item.tanggal_dibuat}
          </Text>
          <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Kedaluwarsa</Text>
          <View className="text-md">
            <Text className="font-poppins-semibold text-black mb-1">
              {item.tanggal_exp_indo || " -"}
            </Text>
            {isExpired && (
              <View className="bg-yellow-100 rounded-md px-2 py-1 max-w-[87px]">
                <Text className="text-yellow-500 text-xs font-bold">
                  Kedaluwarsa
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };
  //

  return (
    <View className="flex-1 bg-gray-100">
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
          }}
        />

        <RNPickerSelect
          items={statuses.map(item => ({ label: item.text, value: item.id }))}
          value={status}
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
          onValueChange={handleStatusChange}
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
            label: "Pilih Status",
            value: null,
            color: "grey",
          }}></RNPickerSelect>
        <View className=" justify-center items-center">
          <TouchableOpacity
            className="bg-red-500 p-2  rounded-lg"
            onPress={handleSave}>
            <Text className="font-sans text-white">Laporan</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        key={refreshKey}
        url="/pembayaran/global"
        payload={{ tahun, status }}
        renderItem={cardGlobal}></Paginate>
      <SaveConfirmationModal />
    </View>
  );
};

export default Global;

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: rem(0.7),
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: '#312e81',
    borderTopWidth: 7,
    marginVertical: 10,
  },
  cards: {
    borderRadius: 10,
    width: "100%",
    marginBottom: 4,
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
