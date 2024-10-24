import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather"
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDelete } from "@/src/hooks/useDelete";
import SearchInput from "@/src/screens/components/SearchInput";
import Paginate from "@/src/screens/components/Paginate";
import BackButton from "@/src/screens/components/BackButton";

const LogTte = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deletePeraturan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/konfigurasi/log-tte"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const CardLogTte = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-3">
          <Text className="text-[17px] font-poppins-bold">{item.titik_permohonan.kode}</Text>
          <Text className="text-sm font-poppins-semibold">NIK : {item.nik}</Text>
          <Text className="text-sm font-poppins-regular">Status : {item.status}</Text>
          <Text className="text-sm font-poppins-regular">Message : {item.message}</Text>
          <Text className="text-sm font-poppins-regular">Ip Address : {item.ip_address}</Text>
          <Text className="text-sm font-poppins-regular">User Agent : {item.user_agent}</Text>
          <Text className="text-sm font-poppins-regular">Waktu : {item.tanggal_indo}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <Paginate
        ref={paginateRef}
        url="/konfigurasi/log-tte"
        renderItem={CardLogTte}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default LogTte;
