import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
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
import { useHeaderStore } from "@/src/screens/main/Index";
import { TextFooter } from "../../components/TextFooter";

const TandaTangan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])


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
        <View className="flex-col space-y-1">
          <Text className="text-xs font-poppins-regular text-gray-500">Dokumen</Text>
          <Text className="text-md font-poppins-semibold text-black mb-3">{item.bagian}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">Nama</Text>
          <Text className="text-md font-poppins-semibold text-black mb-3">{item.user?.nama}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">NIP</Text>
          <Text className="text-md font-poppins-medium text-black mb-3">{item.user?.nip}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">NIK</Text>
          <Text className="text-md font-poppins-medium text-black mb-3">{item.user?.nik}</Text>

          <Text className="text-xs font-poppins-regular text-gray-500">Jabatan</Text>
          <Text className="text-md font-poppins-medium text-black">{item.user?.role?.full_name}</Text>
        </View>
      </View>
      <View className="h-[1px] bg-gray-300 my-3" />

      <View className="flex-row justify-end gap-2">``
        <TouchableOpacity
          onPress={() => navigation.navigate("FormTandaTangan", { uuid: item.uuid })}
          className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
        >
          <IonIcon name="pencil" size={14} color="#fff" />
          <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
          <Text className="text-[20px] font-poppins-medium text-black ml-3">Tanda Tangan</Text>
        </View>
        <View className="bg-orange-600 rounded-full">
          <IonIcon name="create" size={18} color={'white'} style={{ padding: 5 }} />
        </View>
      </View>
      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/konfigurasi/tanda-tangan"
          renderItem={CardTandaTangan}
        />
        <View className="mt-12 mb-8">
          <TextFooter />
        </View>
      </ScrollView>
      <DeleteConfirmationModal />
    </View>
  );
};

export default TandaTangan;
