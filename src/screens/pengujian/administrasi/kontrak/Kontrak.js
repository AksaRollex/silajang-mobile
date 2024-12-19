import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalFilterMenu from "@/src/screens/components/HorizontalFilterMenu";
import React, { useState, useRef } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuView } from "@react-native-menu/menu";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useHeaderStore } from "@/src/screens/main/Index";
import { TextFooter } from "@/src/screens/components/TextFooter";


const currentYear = new Date().getFullYear()
const generateYears = () => {
  let years = []
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) })
  }
  return years
}

const kesimpulanOptions = [
  { id: 0, name: "Menunggu Konfirmasi" },
  { id: 1, name: "Telah Konfirmasi" },
  { id: 2, name: "Konfirmasi Ditolak" },
];

const Kontrak = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedKesimpulan, setSelectedKesimpulan] = useState(0);
  const paginateRef = useRef();
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const renderItem = ({ item }) => {

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-2 relative">
          <View className="flex-shrink mr-20">
            <Text className="text-xs text-gray-500 font-poppins-regular">Nama Industri</Text>
            <Text className="text-md font-poppins-semibold mb-3 text-black">{item.industri}</Text>

            <Text className="text-xs text-gray-500 font-poppins-regular">Alamat</Text>
            <Text className="text-md font-poppins-semibold text-black mb-3">{item.alamat}</Text>
            <Text className="text-xs text-gray-500 font-poppins-regular">Tanggal</Text>
            <Text className="text-md font-poppins-semibold mb-1 text-black">{item.tanggal}</Text>
          </View>
          <View className="absolute right-1 flex-col items-center">
            <Text className={`text-[12px] font-poppins-semibold px-2 py-1 rounded-md mb-3
                ${item.kesimpulan_kontrak == 1 ? 'bg-green-100 text-green-500'
                : item.kesimpulan_kontrak == 2 ? 'bg-red-50 text-red-500'
                  : 'bg-indigo-100 text-indigo-500'}`}>
              {item.kesimpulan_kontrak == 1 ? 'Diterima'
                : item.kesimpulan_kontrak == 2 ? 'Ditolak'
                  : 'Menunggu'}
            </Text>
          </View>
        </View>
        <View className="h-[1px] bg-gray-300 my-3" />
        <View className="flex-row flex-wrap justify-end gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("DetailKontrak", { uuid: item.uuid })}
            className="bg-indigo-900 px-3 py-2 rounded-md"
          >
            <View className="flex-row">
              <Ionicons name="eye-outline" size={17} color="white" style={{ marginRight: 5 }} />
              <Text className="text-white font-poppins-medium text-[12px]">Detail</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="arrow-back-outline"
            onPress={() => navigation.goBack()}
            size={25}
            color="#312e81"
          />
          <Text className="text-[19px] font-poppins-medium text-black ml-4">Kontrak</Text>
        </View>
        <View className="bg-blue-600 rounded-full">
          <Ionicons
            name="document-text"
            size={17}
            color={'white'}
            style={{ padding: 5 }}
          />
        </View>
      </View>
      <View className="p-4">
        <View className="flex-row justify-center">
          <View style={{ flex: 1, marginVertical: 8 }}>
            <HorizontalFilterMenu
              items={kesimpulanOptions}
              selected={selectedKesimpulan}
              onPress={(item) => setSelectedKesimpulan(item.id)}
            />
          </View>


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
              }
            }}
            shouldOpenOnLongPress={false}
          >
            <View >
              <MaterialCommunityIcons
                name="filter-menu-outline"
                size={24}
                color="white"
                style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }}
              />
            </View>
          </MenuView>
        </View>
      </View>
      
      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/administrasi/kontrak"
          payload={{
            kesimpulan_kontrak: selectedKesimpulan,
            tahun: selectedYear,
            page: 1,
            per: 10
          }}
          renderItem={renderItem}
        />
        <View className="mt-12 mb-8">
                  <TextFooter />
                </View>
      </ScrollView>
    </View>
  );
};

export default Kontrak;