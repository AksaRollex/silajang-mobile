import { useNavigation } from "@react-navigation/native";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useDelete } from '@/src/hooks/useDelete';
import SearchInput from "@/src/screens/components/SearchInput";
import Paginate from "@/src/screens/components/Paginate";
import Icon from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons";
import { rupiah } from "@/src/libs/utils";
import BackButton from "@/src/screens/components/BackButton";

const Paket = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

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
            <View className="flex-col space-y-3">
              <Text className="text-[15px] font-poppins-semibold text-black">{item.nama}</Text>
              <Text className="text-12 font-semibold text-black">{rupiah(item.harga)}</Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-300 my-3" />
          
          <View className="flex-row justify-end gap-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate("ParameterPaket", { uuid: item.uuid })}
              className="flex-row items-center bg-green-600 px-2 py-2 rounded"
            >
              <IonIcon name="filter" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Parameter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate("FormPaket", { uuid: item.uuid })}
              className="flex-row items-center bg-[#312e81] px-2 py-2 rounded"
            >
              <IonIcon name="pencil" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => deletePaket(`/master/paket/${item.uuid}`)}
              className="flex-row items-center bg-red-600 px-2 py-2 rounded"
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
    <View className="bg-[#ececec] w-full h-full">
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Paket</Text>
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/paket"
        payload={{}}
        renderItem={renderPaket}
      />
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