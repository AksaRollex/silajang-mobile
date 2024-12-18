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
import { useHeaderStore } from '@/src/screens/main/Index'
import IonIcon from 'react-native-vector-icons/Ionicons'

const LogTte = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const { delete: deletePeraturan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/konfigurasi/log-tte"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const CardLogTte = ({ item }) => {
    // Function to determine status styling
    const getStatusStyle = (status) => {
      switch(status.toLowerCase()) {
        case 'success':
          return {
            bgColor: 'bg-green-100',
            textColor: 'text-green-600'
          };
        case 'error':
          return {
            bgColor: 'bg-red-100',
            textColor: 'text-red-600'
          };
        default:
          return {
            bgColor: 'bg-indigo-100',
            textColor: 'text-indigo-600'
          };
      }
    };
  
    // Get status styling
    const statusStyles = getStatusStyle(item.status);
  
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-col">
  
            <Text className="text-xs font-poppins-regular text-gray-500">Kode Sampel</Text>
            <Text className="text-md font-poppins-bold text-black mb-3">{item.titik_permohonan?.kode}</Text>
  
            <Text className="text-xs font-poppins-regular text-gray-500">NIK</Text>
            <Text className="text-md font-poppins-semibold text-black mb-3">{item.nik}</Text>
  
            <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Status</Text>
            <View className={`${statusStyles.bgColor} rounded-md px-2 py-1 max-w-[60px] mb-3`}>
              <Text className={`text-[10px] ${statusStyles.textColor} font-poppins-semibold text-center`}>
                {item.status}
              </Text>
            </View>

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
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
          <Text className="text-[20px] font-poppins-medium text-black ml-3">Log TTE</Text>
        </View>
        <View className="bg-blue-600 rounded-full">
          <IonIcon name="document-text" size={18} color={'white'} style={{ padding: 5 }} />
        </View>
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
