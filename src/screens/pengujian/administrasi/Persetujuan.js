import axios from "@/src/libs/axios";
import React, { useState, useEffect } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import { Searchbar } from "react-native-paper";

const currentYear = new Date().getFullYear()
const generateYears = () => {
  let years = []
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) })
  }
  return years
}

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

const PengambilSampel = ({ navigation }) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const filterOptions = generateYears();

  const dropdownOptions = [
    // {
    //   id: "Edit",
    //   title: "Edit",
    //   action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    // },
    // { id: "Hapus", title: "Hapus", action: item => deleteMetode(`/master/acuan-metode/${item.uuid}`) },
    { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailKontrak", { uuid: item.uuid }) }
  ];

  const fetchPengambilSample = async ({ queryKey }) => {
    const [_, search, year] = queryKey;
    const response = await axios.post('/administrasi/pengambil-sample', { 
      search,
      tahun: year,
      status: 0,
      page: 1,
      per: 10 
    });
    console.log(response.data.data)  
    return response.data.data;
  };

  const { data, isLoading: isLoadingData } = useQuery(
    ['pengambil-sample', debouncedSearchQuery, selectedYear],
    fetchPengambilSample,
    {
      onSuccess: (data) => {
        console.log(selectedYear)
        console.log(data);
      },
      onError: (error) => {
        console.error(error);
      }
    }
  );

  const TabelPengambilSample = ({ item }) => {
    return (
<View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-4 relative">
            <View className="flex-shrink mr-20">
                <Text className="text-[20px] font-extrabold mb-3">{item.permohonan.industri}</Text>
                <Text className="text-[14px] mb-2"></Text>
            </View>
            <View className="absolute right-1 flex-col items-center">
                <Text className="text-[12px] text-white font-bold bg-green-400 px-2 py-1 rounded-sm mb-3">Menunggu</Text>
                <View className="my-2 ml-10">
                    <MenuView
                      title="dropdownOptions"
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
                      shouldOpenOnLongPress={false}
                    >
                      <View>
                        <Entypo name="dots-three-vertical" size={18} color="#312e81" />
                      </View>
                    </MenuView>
                </View>
            </View>
        </View>

      </View>

    )
  };

  if (isLoadingData) {
    return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="bg-white p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">

            <View className="flex-row items-center space-x-2 mb-4">
            <BackButton action={() => navigation.goBack()} size={26} />
            <View className="absolute left-0 right-2 items-center">
              <Text className="text-[20px] font-bold">Persetujuan</Text>
            </View>
            </View>

            <View className="flex-row justify-content-center">
                <MenuView
                  title="filterOptions"
                  actions={filterOptions.map(option => ({
                    id: option.id.toString(),
                    title: option.title,
                  }))}
                  onPressAction={({ nativeEvent }) => {
                    const selectedOption = filterOptions.find(
                      option => option.title === nativeEvent.event,
                    );
                    if (selectedOption) {
                      setSelectedYear(selectedOption.title)
                      // console.log(selectedOption.title)
                    }
                  }}
                  shouldOpenOnLongPress={false}
                >
                  <View>
                    <MaterialCommunityIcons name="filter-menu-outline" size={24} color="white" style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }} />
                  </View>
                </MenuView>
            </View>
            <FlatList
              className="mt-4"
              data={data}
              renderItem={({ item }) => <TabelPengambilSample item={item} />}
              keyExtractor={item => item.id.toString()}
              />

          </View>
        </View>
      </View>
        


    <AntDesign
      name="plus"
      size={28}
      color="white"
      style={{ position: "absolute", bottom: 90, right: 30, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
      // onPress={() => navigation.navigate("FormMetode")}
      />
  </View>
  );
};

export default PengambilSampel; 