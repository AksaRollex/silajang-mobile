import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDelete } from '@/src/hooks/useDelete';
import SearchInput from "@/src/screens/components/SearchInput";

// Custom hook for debounce
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

const Metode = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  const { delete: deleteMetode, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['metode']);
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    },
    { id: "Hapus", title: "Hapus", action: item => deleteMetode(`/master/acuan-metode/${item.uuid}`) },
  ];

  const fetchMetode = async ({ queryKey }) => {
    const [_, search] = queryKey;
    const response = await axios.post('/master/acuan-metode', { search });
    return response.data.data;
  };

  const { data, isLoading: isLoadingData } = useQuery(
    ['metode', debouncedSearchQuery],
    fetchMetode,
    {
      onError: (error) => {
        console.error(error);
      }
    }
  );

  const TabelMetode = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-[18px] font-bold">{item.nama}</Text>
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
              <Entypo name="dots-three-vertical" size={18} color="#312e81" />
            </View>
          </MenuView>
        </View>
      </View>
    );
  };

  if (isLoadingData) {
    return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="bg-white p-4">
      <SearchInput 
        onChangeText={setSearchInput}
        value={searchInput}
        placeholder={"Cari Metode"}
        className="bg-[#f1f1f1] flex-1"
        size={26} action={() => navigation.goBack()} 
      />
        <FlatList
          className="mt-4"
          data={data}
          renderItem={({ item }) => <TabelMetode item={item} />}
          keyExtractor={item => item.id.toString()}
        />
      </View>
      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormMetode")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default Metode;