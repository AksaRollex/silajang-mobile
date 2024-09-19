import axios from "@/src/libs/axios";
// import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { FlatList, Text, View, ActivityIndicator } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { useDelete } from '@/src/hooks/useDelete';
// import SearchInput from "@/src/screens/components/SearchInput";
import BackButton from "@/src/screens/components/BackButton";
import { Searchbar } from "react-native-paper";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";

const currentYear = new Date().getFullYear()
const generateYears = () => {
  let years = []
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) })
  }
  return years
}

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

const Kontrak = ({ navigation }) => {
  // const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedKesimpulan, setSelectedKesimpulan] = useState(0);
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  // const { delete: deleteMetode, DeleteConfirmationModal } = useDelete({
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(['metode']);
  //   },
  //   onError: (error) => {
  //     console.error('Delete error:', error);
  //   }
  // });

  const filterOptions = generateYears();

  const kesimpulanOptions = [
    { id: 0, name: "Menunggu Konfirmasi" },
    { id: 1, name: "Telah Konfirmasi" },
    { id: 2, name: "Konfirmasi Ditolak" },
  ];

  const dropdownOptions = [
    // {
    //   id: "Edit",
    //   title: "Edit",
    //   action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    // },
    // { id: "Hapus", title: "Hapus", action: item => deleteMetode(`/master/acuan-metode/${item.uuid}`) },
    { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailKontrak", { uuid: item.uuid }) }
  ];

  const fetchKontrak = async ({ queryKey }) => {
    const [_, search, year, kesimpulan] = queryKey;
    const response = await axios.post('/administrasi/kontrak', { 
      search,
      tahun: year,
      kesimpulan_kontrak: kesimpulan,
      page: 1,
      per: 10 
    });
    // console.log(response.data.data)
    return response.data.data;
  };

  const { data, isLoading: isLoadingData } = useQuery(
    ['kontrak', debouncedSearchQuery, selectedYear, selectedKesimpulan],
    fetchKontrak,
    {
      onSuccess: (data) => {
        console.log(selectedYear)
        console.log(selectedKesimpulan)
        console.log(data);
      },
      onError: (error) => {
        console.error(error);
      }
    }
  );
  // console.log(data)

  const TabelKontrak = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-4 relative">
            <View className="flex-shrink mr-20">
                <Text className="text-[20px] font-extrabold mb-3">{item.industri}</Text>
                <Text className="text-[14px] mb-2">asjdgasjdkashdkjshklashdkhaskdhashdkahsdhaslkdhlkashd</Text>
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
    );
  };

  if (isLoadingData) {
    return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
  }

  // if (data?.length < 0) {
  //   return <View><Text className="text-[20px] font-bold mt-100">KOSONG!</Text></View>
  // }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="bg-white p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-0 items-center">
                <Text className="text-[20px] font-bold">Kontrak</Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-2">
              <Searchbar
                className="bg-[#f1f1f1] flex-1"
                placeholder={"Cari Kontrak"}
                onChangeText={setSearchInput}
                value={searchInput}
              />
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
            <View className="flex-row items-start space-x-2 mt-4">
              <HorizontalScrollMenu
                items={kesimpulanOptions}
                selected={selectedKesimpulan}
                onPress={item => setSelectedKesimpulan(item.id)} // Update selectedKesimpulan
                itemWidth={185}
                scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                activeBackgroundColor={ "#312e81" }
                buttonStyle={{ marginRight: 10, borderRadius: 20, justifyContent: 'flex-start' }}
              />
            </View>
            <FlatList
              className="mt-4"
              data={data}
              renderItem={({ item }) => <TabelKontrak item={item} />}
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
      {/* <DeleteConfirmationModal /> */}
    </View>
  );
};

export default Kontrak;