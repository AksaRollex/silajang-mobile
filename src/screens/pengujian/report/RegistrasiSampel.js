import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, PermissionsAndroid, Platform, ScrollView,} from "react-native";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from 'moment';
import Paginate from "@/src/screens/components/Paginate";
import { APP_URL } from "@env";
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import BackButton from "@/src/screens/components/BackButton";
import { useHeaderStore } from "../../main/Index";
import { TextFooter } from "@/src/screens/components/TextFooter";


const RegistrasiSampel = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])


  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  const monthOptions = [
    { id: 1, title: "Januari" },
    { id: 2, title: "Februari" },
    { id: 3, title: "Maret" },
    { id: 4, title: "April" },
    { id: 5, title: "Mei" },
    { id: 6, title: "Juni" },
    { id: 7, title: "Juli" },
    { id: 8, title: "Agustus" },
    { id: 9, title: "September" },
    { id: 10, title: "Oktober" },
    { id: 11, title: "November" },
    { id: 12, title: "Desember" },
  ];

  const handleYearChange = (event) => {
    setSelectedYear(event.nativeEvent.event);
    paginateRef.current?.refetch();
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.nativeEvent.event);
    paginateRef.current?.refetch();
  };

  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedYear, selectedMonth]);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Number(Platform.Version) < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const downloadReport = async () => {
    try {
      setIsDownloading(true);
      const hasPermission = await requestStoragePermission();
      
      if (!hasPermission) {
        return;
      }

      const response = await axios.get(`/report/registrasi-sampel?tahun=${selectedYear}&bulan=${selectedMonth}`, {
        responseType: 'arraybuffer',
      });

      // Generate filename with timestamp and month/year info
      const monthName = monthOptions.find(m => m.id.toString() === selectedMonth)?.title;
      const timestamp = new Date().getTime();
      const fileName = `Registrasi Sampel ${selectedYear}_${monthName}_${timestamp}.xlsx`;

      // Determine path based on platform
      const path = Platform.OS === "ios" 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}` 
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Convert buffer to ASCII string
      const buffer = new Uint8Array(response.data);
      const fileContent = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');

      // Save file
      await RNFS.writeFile(path, fileContent, 'ascii');

      Toast.show({
        type: 'success',
        text1: 'Berhasil!',
        text2: 'Laporan Registrasi Sampel berhasil diunduh',
      });
    } catch (error) {
      console.error('Error saat mengunduh file:', error);
      Toast.show({
        type: 'error',
        text1: 'Gagal!',
        text2: 'Tidak dapat mengunduh laporan',
      });
    } finally {
      setIsDownloading(false);
      setModalVisible(false);
    }
  };

  const CardRegistrasiSampel = ({ item }) => (
    <View
      className="my-4 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row items-center">
        <View className="" style={{ width: "90%" }}>
          <View className="flex-col space-y-2">
            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Masuk</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.tanggal_diterima || '-'}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Selesai</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.tanggal_selesai || '-'}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
              <Text className="text-md font-poppins-semibold text-black"
                numberOfLines={2}
                style={{ flexWrap: 'wrap' }}>
                {item.permohonan?.user?.nama}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Alamat</Text>
              <Text className="text-md font-poppins-semibold text-black"
                numberOfLines={3}>
                {item.permohonan?.user?.detail?.alamat}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Lokasi</Text>
              <Text className="text-md font-poppins-semibold text-black"
                numberOfLines={3}>
                {item.permohonan?.alamat}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Titik Sampling</Text>
              <Text className="text-md font-poppins-semibold text-black"
                numberOfLines={2}>
                {item.lokasi}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

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
          <Text className="text-[20px] font-poppins-medium text-black ml-4">Registrasi Sampel</Text>
        </View>
        <View className="bg-teal-600 rounded-full">
          <Ionicons
            name="list"
            size={18}
            color={'white'}
            style={{ padding: 5 }}
          />
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-center">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  width: 185,
                  borderColor: "#d1d5db",
                  borderWidth: 1
                }}>
                <Text style={{ color: "black", flex: 1, textAlign: "center", fontFamily: "Poppins-SemiBold" }}>
                  {`Tahun: ${selectedYear}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>

          <MenuView
            title="Pilih Bulan"
            onPressAction={handleMonthChange}
            actions={monthOptions.map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  width: 185,
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                }}>
                <Text style={{ color: "black", flex: 1, textAlign: "center", fontFamily: "Poppins-SemiBold" }}>
                  {`Bulan: ${monthOptions.find(m => m.id.toString() === selectedMonth)?.title || 'Pilih'}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-green-100 justify-center items-center mb-4">
              <FontAwesome5 size={40} color="#177a44" name="file-excel" />
            </View>

            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Konfirmasi Download
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
              Apakah Anda yakin ingin Mengunduh Report Berformat Excel?
            </Text>

            <View className="flex-row w-full justify-between">
              <TouchableOpacity
                onPress={() => {
                  downloadReport();
                }}
                className="flex-1 mr-2 bg-green-500 py-3 rounded-xl items-center"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-poppins-medium">Ya, Download</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 ml-3 bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-poppins-medium">Batal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/report/registrasi-sampel"
          payload={{
            tahun: selectedYear,
            bulan: selectedMonth,
            page: 1,
            per: 10,
          }}
          renderItem={CardRegistrasiSampel}
          className="bottom-2"
        />
        <View className="mt-12 mb-8">
          <TextFooter />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          position: 'absolute',
          bottom: 25,
          right: 15,
          backgroundColor: '#177a44',
          borderRadius: 50,
          width: 55,
          height: 55,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          zIndex: 1000
        }}>
        <FontAwesome5 name="file-excel" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default RegistrasiSampel;