import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from 'moment';
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";

const TrackingPengujian = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  const monthOptions = [
    { id: 1, title: "Januari" },
    { id: 2, title: "Februari" },
    { id: 3, title: "Maret" },
    { id: 4, title: "April" },
    { id: 5, title: "Mei" },
    { id: 6, title: "Juni" },
    { id: 7, title: "Juli" },
    { id: 8, title: "Agustus" },
    { id: 9, title: "September" },
    { id: 10, title: "Oktober" },
    { id: 11, title: "November" },
    { id: 12, title: "Desember" },
  ];

  const handleYearChange = (event) => {
    setSelectedYear(event.nativeEvent.event);
    paginateRef.current?.refetch();
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.nativeEvent.event);
    paginateRef.current?.refetch();
  };

  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedYear, selectedMonth]);

  const { delete: deletePeraturan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/tracking"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const dropdownOptions = [
    {
      id: "Tracking",
      title: "Tracking",
      action: item => navigation.navigate("DetailTracking", { selected: item }),
    },
  ];

  const mapStatusPengujian = (status) => {
    const statusPengujian = {
      "-1": "Revisi",
      0: "Mengajukan Permohonan",
      1: "Menyerahkan Sampel",
      2: "Menyerahkan Surat Perintah Pengujian",
      3: "Menyerahkan sampel untuk Proses Pengujian",
      4: "Menyerahkan RDPS",
      5: "Menyerahkan RDPS untuk Pengetikan LHU",
      6: "Menyerahkan LHU untuk Diverifikasi",
      7: "Mengesahkan LHU",
      8: "Pembayaran",
      9: "Penyerahan LHU",
      10: "Penyerahan LHU Amandemen (Jika ada)",
      11: "Selesai"
    };

    return statusPengujian[status] || "Sedang Diproses";
  };

  const CardTrackingPengujian = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row items-center ">
        <View className="" style={{ width: "90%" }}>
          <View className="flex-col justify-between items-start mb-2">
            <Text className="text-[17px] font-poppins-bold">{item.kode}</Text>
            <View className={` py-1 rounded-full  ${item.status < 0 ? 'bg-yellow-100' : 'bg-slate-100'
              }`}>
              <Text className={`text-[12px] font-bold  text-right ${item.status < 0 ? 'text-yellow-800' : 'text-indigo-600'
                }`} numberOfLines={2}>
                {mapStatusPengujian(item.status)}
              </Text>
            </View>
          </View>

          <View className="flex-col space-y-2">
            <View>
              <Text className="text-[12px] font-poppins-bold text-gray-700">Pelanggan:</Text>
              <Text className="text-[12px] font-poppins-semibold"
                numberOfLines={2}
                style={{ flexWrap: 'wrap' }}>
                {item.permohonan?.user?.nama}
              </Text>
            </View>

            <View>
              <Text className="text-[12px] font-poppins-bold text-gray-700">Titik Uji/Lokasi:</Text>
              <Text className="text-[12px] font-poppins-semibold"
                numberOfLines={2}>
                {item.lokasi}
              </Text>
            </View>

            <View className="space-y-1">
              <Text className="text-[11px] font-poppins-semibold text-gray-600">
                Tanggal Dibuat: {item.tanggal || '-'}
              </Text>
              <Text className="text-[11px] font-poppins-semibold text-gray-600">
                Tanggal Diterima: {item.tanggal_diterima || '-'}
              </Text>
              <Text className="text-[11px] font-poppins-semibold text-gray-600">
                Tanggal Selesai: {item.tanggal_selesai || '-'}
              </Text>
              <Text className="text-[11px] font-poppins-semibold text-gray-600">
                Tanggal Pengesahan LHU: {item.tracking_status_7 || '-'}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ width: "10%" }} className=" flex justify-start items-center">

          <MenuView

            title="Options"
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
              <Entypo name="dots-three-vertical" size={18} color="#312e81" />
            </View>
          </MenuView>
        </View>

      </View>

      {item.status < 0 && item.keterangan_revisi && (
        <View className="mt-3 bg-yellow-50 p-3 rounded-md">
          <Text className="text-[11px] text-yellow-800">
            Keterangan Revisi: {item.keterangan_revisi}
          </Text>
        </View>
      )}
    </View>

  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-gray-100 p-4 shadow-sm">
        <View className="flex-row justify-end space-x-3">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  width: 185,
                  borderColor: "#d1d5db",
                  borderWidth: 1
                }}>
                <Text style={{ color: "black", flex: 1, textAlign: "center" }}>
                  {`Tahun: ${selectedYear}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>

          <MenuView
            title="Pilih Bulan"
            onPressAction={handleMonthChange}
            actions={monthOptions.map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  width: 185,
                  borderColor: "#d1d5db",
                  borderWidth: 1
                }}>
                <Text style={{ color: "black", flex: 1, textAlign: "center" }}>
                  {`Bulan: ${monthOptions.find(m => m.id.toString() === selectedMonth)?.title || 'Pilih'}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/tracking"
        payload={{
          tahun: selectedYear,
          bulan: selectedMonth,
          page: 1,
          per: 10,
        }}
        renderItem={CardTrackingPengujian}
      />

      <DeleteConfirmationModal />
    </View>
  );
};

export default TrackingPengujian;