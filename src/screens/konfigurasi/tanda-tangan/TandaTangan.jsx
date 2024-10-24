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

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormTandaTangan", { uuid: item.uuid }),
      icon: 'edit'
    },
  ];

  const CardTandaTangan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-3">
        <Text className="text-[15px] font-poppins-bold">{item.bagian}</Text>
        <Text className="text-sm font-poppins-bold">Nama : {item.user?.nama}</Text>
        <Text className="text-sm font-poppins-semibold">NIP : {item.user?.nip}</Text>
        <Text className="text-sm font-poppins-semibold">NIK : {item.user?.nik}</Text>
        <Text className="text-sm font-poppins-semibold">Jabatan : {item.user?.role?.full_name}</Text>
        </View>
        <MenuView
          title="Menu Title"
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
            <Entypo name="dots-three-vertical" size={15} color="#312e81" />
          </View>
        </MenuView>
      </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
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
