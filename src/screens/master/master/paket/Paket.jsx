import { useNavigation } from "@react-navigation/native";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useDelete } from '@/src/hooks/useDelete';
import SearchInput from "@/src/screens/components/SearchInput";
import Paginate from "@/src/screens/components/Paginate";
import Icon from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons";
import { rupiah } from "@/src/libs/utils";
import BackButton from "@/src/screens/components/BackButton";
import { useHeaderStore } from "@/src/screens/main/Index";
import { TextFooter } from "@/src/screens/components/TextFooter";

const Paket = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])


  const { delete: deletePaket, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['paket']);
      paginateRef.current?.refetch()
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const renderPaket = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View>
          <View className="flex-row justify-between items-center">
            <View className="flex-col space-y-1">
              <Text className="text-md text-gray-500 font-poppins-regular">Nama</Text>
              <Text className="text-[15px] font-poppins-semibold text-black mb-3">{item.nama}</Text>

              <Text className="text-md text-gray-500 font-poppins-regular">Harga</Text>
              <Text className="text-12 font-semibold text-black">{rupiah(item.harga)}</Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-300 my-3" />

          <View className="flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={() => navigation.navigate("ParameterPaket", { selected: item.uuid })}
              className="flex-row items-center bg-green-500 px-2 py-2 rounded"
            >
              <IonIcon name="filter" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Parameter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("FormPaket", { uuid: item.uuid })}
              className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
            >
              <IonIcon name="pencil" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deletePaket(`/master/paket/${item.uuid}`)}
              className="flex-row items-center bg-red-500 px-2 py-2 rounded"
            >
              <IonIcon name="trash" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full relative" contentContainerStyle={{ flexGrow: 1 }}>
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
          <Text className="text-[20px] font-poppins-medium text-black ml-3">Paket</Text>
        </View>
        <View className="bg-orange-500 rounded-full">
          <IonIcon name="cube" size={18} color={'white'} style={{ padding: 5 }} />
        </View>
      </View>
      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/master/paket"
          payload={{}}
          renderItem={renderPaket}
        />
      </ScrollView>
      <View className="mt-12 mb-8">
        <TextFooter />
      </View>
      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormPaket")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default Paket;