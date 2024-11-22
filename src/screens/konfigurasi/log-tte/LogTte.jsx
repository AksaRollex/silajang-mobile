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
        <View className="flex-col">
          <Text className="text-xs font-poppins-regular text-gray-500">Kode Sampel</Text>
          <Text className="text-md font-poppins-bold text-black mb-3">{item.titik_permohonan.kode}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">NIK</Text>
          <Text className="text-md font-poppins-semibold text-black mb-3">{item.nik}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">Status</Text>
          <Text className="text-md font-poppins-medium text-black mb-3">{item.status}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">Message</Text>
          <Text className="text-md font-poppins-medium text-black mb-3">{item.message}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">IP Address</Text>
          <Text className="text-md font-poppins-medium text-black mb-3">{item.ip_address}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">User Agent</Text>
          <Text className="text-md font-poppins-medium text-black mb-3">{item.user_agent}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">Waktu</Text>
          <Text className="text-md font-poppins-medium text-black">{item.tanggal_indo}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Log TTE</Text>
      </View>
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
