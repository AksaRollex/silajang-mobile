import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState } from "react";
import { Text, View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useQueryClient } from '@tanstack/react-query';


const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const pengambilOptions = [
  { id: 0, name: "Menunggu Konfirmasi" },
  { id: 1, name: "Telah Konfirmasi" },
];

const Persetujuan = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedPengambil, setSelectedPengambil] = useState(0);
  const paginateRef = useRef();
  const queryClient = useQueryClient();

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['pengambil-sample']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const renderItem = ({ item }) => {
    const isConfirmed = selectedPengambil === 1; // Telah Konfirmasi
    
    const dropdownOptions = isConfirmed
      ? [
          { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailPersetujuan", { uuid: item.uuid }) },
          { id: "Cetak Sampling", title: "Cetak Sampling", action: item => navigation.navigate("Cetak Sampling", { uuid: item.uuid }) },
          {
            id: "Berita Acara",
            title: "Berita Acara",
            subactions: [
              { id: "Berita Acara Pengambilan", title: "Berita Acara Pengambilan" },
              { id: "Data Pengambilan", title: "Data Pengambilan" },
            ]
          }
        ]
      : [
          { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailPersetujuan", { uuid: item.uuid }) }
        ];

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-4 relative">
          <View className="flex-shrink mr-20">
            <Text className="text-[18px] font-extrabold mb-3">
              {isConfirmed ? item.permohonan.user.nama : item.permohonan.industri}
            </Text>
            <Text className="text-[14px] mb-2">{item.lokasi}</Text>
            <Text className="text-[14px] mb-2">Diambil pada: <Text className="font-bold ">{item.tanggal_pengambilan}</Text></Text>
            <Text className="text-[14px] mb-2">Oleh: <Text className="font-bold">{item.pengambil?.nama}</Text></Text>
          </View>
          <View className="absolute right-1 flex-col items-center">
            <Text className={`text-[12px] text-white font-bold px-2 py-1 rounded-sm mb-3 ${item.kesimpulan_permohonan == 1 ? 'bg-green-400' : item.kesimpulan_permohonan == 2 ? 'bg-red-500' : 'bg-purple-600'}`}>
              {item.kesimpulan_permohonan == 1 ? 'Diterima' : item.kesimpulan_permohonan == 2 ? 'Ditolak' : 'Menunggu'}
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
      <View className=" p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold">Persetujuan</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View className=" mt-3 ml-12 mr-2">
                <HorizontalScrollMenu
                  items={pengambilOptions}
                  selected={selectedPengambil}
                  onPress={item => setSelectedPengambil(item.id)}
                  itemWidth={170}
                  scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                  activeBackgroundColor={"#312e81"}
                  buttonStyle={{ marginRight: 10, borderRadius: 20, backgroundColor: "white" }}
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
                    setSelectedYear(selectedOption.title);
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
        url="/administrasi/pengambil-sample"
        payload={{
          status: selectedPengambil,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
      />

      <AntDesign
        name="plus"
        size={28}
        color="white"
        style={{ position: "absolute", bottom: 90, right: 30, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormMetode")}
      />  
      <DeleteConfirmationModal />
    </View>
  );
};

export default Persetujuan; 