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

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormPeraturan", { uuid: item.uuid }),
      icon: 'edit'
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deletePeraturan(`/master/acuan-peraturan/${item.uuid}`),
    },
    {
      id: "Parameter",
      title: "Parameter",
      action: item =>
        navigation.navigate("ParameterPeraturan", { uuid: item.uuid }),
    },
  ];

  const CardPeraturan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-3">
          <Text className="text-[15px] font-poppins-bold text-black">{item.nama}</Text>
          <Text className="text-base font-poppins-semibold text-black">{item.nomor}</Text>
          <Text className="text-base font-poppins-regular text-black">{item.tentang}</Text>
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
            <Entypo name="dots-three-vertical" size={12} color="#312e81" />
          </View>
        </MenuView>
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
