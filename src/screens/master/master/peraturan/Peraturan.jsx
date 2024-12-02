import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import Icons from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icon from "react-native-vector-icons/Feather";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDelete } from "@/src/hooks/useDelete";
import SearchInput from "@/src/screens/components/SearchInput";
import Paginate from "@/src/screens/components/Paginate";
import BackButton from "@/src/screens/components/BackButton";
import IonIcon from "react-native-vector-icons/Ionicons";

const Peraturan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deletePeraturan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/peraturan"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const CardPeraturan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View>
        <View className="flex-col space-y-1">
          <Text className="text-md text-gray-500 font-poppins-regular">Nama</Text>
          <Text className="text-[15px] font-poppins-bold text-black mb-3">{item.nama}</Text>

          <Text className="text-md text-gray-500 font-poppins-regular">Nomor</Text>
          <Text className="text-[15px] font-poppins-semibold text-black mb-3">{item.nomor}</Text>

          <Text className="text-md text-gray-500 font-poppins-regular">Tentang</Text>
          <Text className="text-[15px] font-poppins-semibold text-black">{item.tentang}</Text>
        </View>

        <View className="h-[1px] bg-gray-300 my-3" />
        
        <View className="flex-row justify-end gap-2">
          <TouchableOpacity 
            onPress={() => navigation.navigate("ParameterPeraturan", { selected: item.uuid })}
            className="flex-row items-center bg-green-600 px-2 py-2 rounded"
          >
            <IonIcon name="filter" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Parameter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate("FormPeraturan", { uuid: item.uuid })}
            className="flex-row items-center bg-[#312e81] px-2 py-2 rounded"
          >
            <IonIcon name="pencil" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => deletePeraturan(`/master/acuan-peraturan/${item.uuid}`)}
            className="flex-row items-center bg-red-600 px-2 py-2 rounded"
          >
            <IonIcon name="trash" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
          </TouchableOpacity>
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
        <Text className="text-[20px] font-poppins-semibold text-black">Peraturan</Text>
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/peraturan"
        renderItem={CardPeraturan}
      />
      <Icons
        name="plus"
        size={28}
        color="#fff"
        className="absolute bottom-5 right-5 bg-[#312e81] p-2 rounded-full"
        onPress={() => navigation.navigate("FormPeraturan")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default Peraturan;