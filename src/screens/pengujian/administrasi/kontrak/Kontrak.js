import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import React, { useState, useRef } from "react";
import { Text, View } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuView } from "@react-native-menu/menu";

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

  const renderItem = ({ item }) => {
    const dropdownOptions = [
      { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailKontrak", { uuid: item.uuid }) }
    ];
    
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-4 relative">
            <View className="flex-shrink mr-20">
                <Text className="text-[18px] font-extrabold mb-3">{item.industri}</Text>
                <Text className="text-[14px] mb-2">Alamat: <Text className="font-bold">{item.alamat}</Text></Text>
                <Text className="text-[14px] mb-2">Tanggal: <Text className="font-bold">{item.tanggal}</Text></Text>
            </View>
            <View className="absolute right-1 flex-col items-center">
              <Text className={`text-[12px] font-bold px-2 py-1 rounded-md mb-3
                ${item.kesimpulan_kontrak == 1 ? 'bg-green-100 text-green-500' 
                  : item.kesimpulan_kontrak == 2 ? 'bg-red-50 text-red-500' 
                  : 'bg-indigo-100 text-indigo-500'}`}>
                    {item.kesimpulan_kontrak == 1 ? 'Diterima' 
                  : item.kesimpulan_kontrak == 2 ? 'Ditolak' 
                  : 'Menunggu'}
              </Text>   
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

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-0 items-center">
                <Text className="text-[20px] font-bold">Kontrak</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View className="mt-3 ml-12 mr-2">
                <View>
                  <HorizontalScrollMenu
                    items={kesimpulanOptions}
                    selected={selectedKesimpulan}
                    onPress={item => setSelectedKesimpulan(item.id)} 
                    itemWidth={170}
                    scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                    activeBackgroundColor={"#312e81"}
                    buttonStyle={{ marginRight: 10, borderRadius: 20, backgroundColor: 'white' }}
                  />
                </View>
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
                <View style={{ marginEnd: 50 }}>
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
        </View>
      </View>

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
        className="mb-14"
        />
    </View>
  );
};

export default Kontrak;