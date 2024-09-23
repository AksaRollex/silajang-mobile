import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/Feather"
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDelete } from "@/src/hooks/useDelete";
import SearchInput from "@/src/screens/components/SearchInput";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Peraturan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  const { delete: deletePeraturan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["peraturan"]);
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

  const fetchPeraturan = async ({ queryKey }) => {
    const [_, search] = queryKey;
    const response = await axios.post("/master/peraturan", { search });
    return response.data.data;
  };

  const { data, isLoading: isLoadingData } = useQuery(
    ["peraturan", debouncedSearchQuery],
    fetchPeraturan,
    {
      onError: error => {
        console.error(error);
      },
    },
  );

  const CardPeraturan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-4">
          <Text className="text-12 font-extrabold">{item.nama}</Text>
          <Text className="text-12 font-semibold">{item.nomor}</Text>
          <Text className="text-10 font-regular">{item.tentang}</Text>
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

  if (isLoadingData) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="mb-10 p-4 rounded">
        <SearchInput
          onChangeText={setSearchInput}
          value={searchInput}
          placeholder={"Cari Peraturan.."}
          className="bg-[#dedede] flex-1"
          size={26}
          action={() => navigation.goBack()}
        />
        <FlatList
          className="mt-4"
          data={data}
          renderItem={({ item }) => <CardPeraturan item={item} />}
          keyExtractor={item => item.uuid}
        />
      </View>
      <Icons
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormPeraturan")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default Peraturan;
