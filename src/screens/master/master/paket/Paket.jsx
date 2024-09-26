import { useNavigation } from "@react-navigation/native";
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { useDelete } from '@/src/hooks/useDelete';
import SearchInput from "@/src/screens/components/SearchInput";
import { MenuView } from "@react-native-menu/menu";
import Paginate from "@/src/screens/components/Paginate";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { rupiah } from "@/src/libs/utils";


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

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormPaket", { uuid: item.uuid }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deletePaket(`/master/paket/${item.uuid}`),
    },
    {
      id: "Parameter",
      title: "Parameter",
      action: item => navigation.navigate("ParameterPaket", { uuid: item.uuid }),
    }

  ];

  const renderPaket = ({ item }) => {
    return (
      <View
        className = "my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ 
          elevation: 4,
         }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-col space-y-3">
            <Text className="text-[18px] font-extrabold">{item.nama}</Text>
            <Text className="text-12 font-semibold">{rupiah(item.harga)}</Text>
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
              <View className="ml-2">
                <Entypo name="dots-three-vertical" size={18} color="#312e81" />
              </View>
            </MenuView>
          </View>
         </View>
    );
  };


  return (
    <View className="bg-[#ececec] w-full h-full">
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