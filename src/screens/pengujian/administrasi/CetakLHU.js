import axios from "@/src/libs/axios";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FlatList, Text, View, ActivityIndicator, Modal, TouchableOpacity } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import FontIcon from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuView } from "@react-native-menu/menu";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const cetakOptions = [
  { id: 0, name: "Belum Cetak/Revisi" },
  { id: 1, name: "Sudah Dicetak" },
];

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

const CetakLHU = ({ navigation }) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const filterOptions = generateYears();
  const [selectedCetak, setSelectedCetak] = useState(1);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  const dropdownOptions = [
  ];

  const handlePreviewLHU = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`);
    setModalVisible(true);
  };

  const fetchCetak = async ({ queryKey }) => {
    const [_, search, year] = queryKey;
    const response = await axios.post('/administrasi/cetak-lhu', {
      search,
      tahun: year,
      status: 5,
      page: 1,
      per: 10
    });
    return response.data.data;
  };

  const renderItem = ({ item }) => {

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
          <View className="flex-row justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-[18px] font-extrabold mb-2">{item.permohonan.user.nama}</Text>
              <Text className="text-[18px] font-extrabold mb-2">{item.kode}</Text>
              <Text className="text-[15px] mb-2">
                Titik Uji/Lokasi: <Text className="font-bold">{item.lokasi}</Text>
              </Text>
              <Text className="text-[15px] mb-2">
                Tanggal Diterima: <Text className="font-bold">{item.tanggal_diterima}</Text>
              </Text>
            </View>
            <View className="flex-shrink-0 items-end">
              <View className="bg-slate-100 rounded-md p-2 max-w-[120px]">
                <Text className="text-[12px] text-indigo-600 font-bold text-right">
                  {item.text_status}
                </Text>
              </View>
            </View>
            <View className="my-2 ml-10">
              <View>
                <TouchableOpacity onPress={() => handlePreviewLHU(item)}>
                  <FontIcon name="file-pdf" size={18} color="white" style={{ backgroundColor: "red", padding: 12, borderRadius: 8 }} />
                </TouchableOpacity>  
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const payload = useMemo(() => {
    return {
      status: selectedCetak === 0 ? [-1, 5] : 5, 
      tahun: selectedYear,
      ...(selectedCetak === 0 && {can_upload: 1})
    }
  }, [selectedCetak, selectedYear])

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="bg-white p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold">Cetak LHU</Text>
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
                    setSelectedYear(selectedOption.title);
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
                items={cetakOptions}
                selected={selectedCetak}
                onPress={item => setSelectedCetak(item.id)} 
                itemWidth={185}
                scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                activeBackgroundColor={"#312e81"}
                buttonStyle={{ marginRight: 10, borderRadius: 20, justifyContent: 'flex-start' }}
              />
            </View>
          </View>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/administrasi/cetak-lhu"
        payload={payload}
        renderItem={renderItem}
        className="mb-14"
      />

        <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5">
            <Text className="text-lg font-bold m-4">Preview LHU</Text>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1 }}
              trustAllCerts={false}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-red-500 p-2 m-4 rounded">
              <Text className="text-white text-center">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

export default CetakLHU;