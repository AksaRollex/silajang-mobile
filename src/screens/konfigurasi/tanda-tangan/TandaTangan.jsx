import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import IonIcon from "react-native-vector-icons/Ionicons";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather"
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDelete } from "@/src/hooks/useDelete";
import SearchInput from "@/src/screens/components/SearchInput";
import Paginate from "@/src/screens/components/Paginate";
import BackButton from "@/src/screens/components/BackButton";

const TandaTangan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deletePeraturan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/konfigurasi/tanda-tangan"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });


  const CardTandaTangan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-3">
        <Text className="text-[15px] font-poppins-semibold text-black">{item.bagian}</Text>
        <Text className="text-sm font-poppins-semibold text-black">Nama : {item.user?.nama}</Text>
        <Text className="text-sm font-poppins-medium text-black">NIP : {item.user?.nip}</Text>
        <Text className="text-sm font-poppins-medium text-black">NIK : {item.user?.nik}</Text>
        <Text className="text-sm font-poppins-medium text-black">Jabatan : {item.user?.role?.full_name}</Text>
        </View>
      </View>
        <View className="h-[1px] bg-gray-300 my-3" />
          
          <View className="flex-row justify-end gap-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate("FormTandaTangan", { uuid: item.uuid })}
              className="flex-row items-center bg-[#312e81] px-2 py-2 rounded"
            >
              <IonIcon name="pencil" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
            </TouchableOpacity>
          </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Tanda Tangan</Text>
      </View>
      <Paginate
        ref={paginateRef}
        url="/konfigurasi/tanda-tangan"
        renderItem={CardTandaTangan}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default TandaTangan;
