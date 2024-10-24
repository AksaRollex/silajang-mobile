import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, TextComponent } from "react-native";
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

  // Generate month options
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
      id: "Detail",
      title: "Detail",
      action: item => navigation.navigate("DetailTrackingPengujian", { uuid: item.uuid }),
      icon: 'eye'
    },
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormTrackingPengujian", { uuid: item.uuid }),
      icon: 'edit'
    },
  ];

  const CardTrackingPengujian = ({ item }) => (
    <View
      className="my-2 bg-white rounded-lg shadow-md p-4 mx-4"
      style={{ elevation: 3 }}>
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-bold">{item.kode}</Text>
            <View className={`px-3 py-1 rounded-full ${
              item.status < 0 ? 'bg-yellow-100' : 'bg-blue-100'
            }`}>
              <Text className={`text-xs ${
                item.status < 0 ? 'text-yellow-800' : 'text-blue-800'
              }`}>
                {item.status < 0 ? 'Revisi' : 'Info'}
              </Text>
            </View>
          </View>
          
          <Text className="text-sm mb-1">Pelanggan: {item.permohonan?.user?.nama}</Text>
          <Text className="text-sm mb-1">Titik Uji/Lokasi: {item.lokasi}</Text>
          
          <View className="mt-2 space-y-1">
            <Text className="text-xs text-gray-600">
              Tanggal Dibuat: {item.tanggal || '-'}
            </Text>
            <Text className="text-xs text-gray-600">
              Tanggal Diterima: {item.tanggal_diterima || '-'}
            </Text>
            <Text className="text-xs text-gray-600">
              Tanggal Selesai: {item.tanggal_selesai || '-'}
            </Text>
            <Text className="text-xs text-gray-600">
              Tanggal Pengesahan LHU: {item.tracking_status_7 || '-'}
            </Text>
          </View>
        </View>
        
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
          <View className="p-2">
            <Entypo name="dots-three-vertical" size={16} color="#374151" />
          </View>
        </MenuView>
      </View>

      {item.status < 0 && item.keterangan_revisi && (
        <View className="mt-3 bg-yellow-50 p-3 rounded-md">
          <Text className="text-xs text-yellow-800">
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
                  Tahun
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>

          <MenuView
            title="Pilih Bulan"
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
                }}>
                  borderWidth: 1
                <Text style={{ color: "black", flex: 1, textAlign: "center" }}>
                  Bulan
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
