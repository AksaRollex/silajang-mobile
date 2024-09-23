import axios from "@/src/libs/axios"
import { useNavigation } from "@react-navigation/native"
import React, { useState, useEffect } from "react"
import { FlatList, Text, View, ActivityIndicator, StyleSheet } from "react-native"
import Icons from "react-native-vector-icons/AntDesign"
import Entypo from "react-native-vector-icons/Entypo"
import { MenuView } from "@react-native-menu/menu"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDelete } from "@/src/hooks/useDelete"
import SearchInput from "@/src/screens/components/SearchInput"
import useDebounce from "@/src/hooks/useDebounce"
import { rupiah } from "@/src/libs/utils"

const Parameter = ({ navigation }) => {
  const queryClient = useQueryClient()
  const [seacrhInput, setSearchInput] = useState("");
  const debouncedSearchQuery = useDebounce(seacrhInput, 300);
  const { delete: deleteParameter, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["parameter"]);
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormParameter", { uuid: item.uuid }),
      icon: 'edit'
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteParameter(`/master/parameter/${item.uuid}`),
    },
  ];

  const fetchParameter = async ({ queryKey }) => {
    const [_, search] = queryKey;
    const response = await axios.post("/master/parameter", { search });
    return response.data.data;
  };

  const { data, isLoading: isLoadingParameter } = useQuery(
    ["parameter", debouncedSearchQuery],
    fetchParameter,
    {
      onError: error => {
        console.error("Fetch parameter error:", error);
      },
    }
  )

  const CardParameter = ({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md 
    border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-4">
          <View className="flex-col justify-between">
            <Text className="text-lg font-poppins-bold">{item.nama}</Text>
            <Text className="text-md font-poppins-semibold">{item.metode}</Text>
          </View>
          <View className="flex-col ">
            <Text className="text-md font-poppins-medium">{item.satuan}</Text>
            <Text className="text-lg font-poppins-semibold">{rupiah(item.harga)}</Text>
            <Text className="text-md font-poppins-medium">{item.mdl}</Text>
          </View>
        </View>
        <MenuView title="Menu"
        actions={dropdownOptions.map(option => ({
          ...option,
        }))}
        onPressAction={({ nativeEvent }) => {
          const selectedOption = dropdownOptions.find(
            option => option.title === nativeEvent.event,
          );
          if(selectedOption){
            selectedOption.action(item);
          }
        }}
        shouldOpenOnLongPress={false}>
        <View className="flex-col gap-4 items-end">
        <Text className={`text-sm font-poppins-regular p-1 rounded-md ${item.is_akreditasi ? 'bg-green-400' : 'bg-yellow-100'} 
                ${item.is_akreditasi ? 'text-white' : 'text-yellow-400'}`}> {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'} </Text>
          <Entypo name="dots-three-vertical" size={12} color="#312e81" />
        </View>
        </MenuView>
      </View>
    </View>
  )

  if(isLoadingParameter){
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    )
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="mb-10 p-4 rounded">
        <SearchInput 
        onChangeText={setSearchInput}
        value={seacrhInput}
        placeholder={"Cari Parameter..."}
        className="bg-[#dedede] flex-1"
        size={26}
        action={() => navigation.goBack()}
        />
        <FlatList
        className="mt-4"
        data={data}
        renderItem={({ item }) => <CardParameter item={item} />}
        keyExtractor={item => item.uuid}
        />
      </View>
      <Icons 
      name="plus"
      size={28}
      color="#fff"
      style={{ position: "absolute", bottom: 20, 
      right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
      onPress={() => navigation.navigate("FormParameter")}
      />
    </View>
  )
}

export default Parameter