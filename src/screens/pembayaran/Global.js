import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import axios from "@/src/libs/axios";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import RNPickerSelect from "react-native-picker-select";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import RNFS from "react-native-fs";
import Toast from "react-native-toast-message";
import { rupiah } from "@/src/libs/utils";
import { TextFooter } from "../components/TextFooter";
import { useHeaderStore } from "../main/Index";

const rem = multiplier => 16 * multiplier;

const Global = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("-");
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const { setHeader } = useHeaderStore();
        
      React.useLayoutEffect(() => {
        setHeader(false)
    
        return () => setHeader(true)
      }, [])


  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2022; year <= currentYear; year++) {
      years.push({
        id: year,
        title: year.toString(),
      });
    }
    return years;
  };

  const statusOptions = [
    { id: "-", title: "Semua" },
    { id: "pending", title: "Pending" },
    { id: "success", title: "Sukses" },
    { id: "failed", title: "Gagal" },
  ];

  const handleYearChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedYear(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleStatusChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedStatus(selectedId);
    paginateRef.current?.refetch();
  }, []);

  const PickerButton = ({ label, value, style }) => (
    <View
      style={[{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        width: 185,
        borderColor: "#d1d5db",
        borderWidth: 1
      }, style]}>
      <Text style={{
        color: "black",
        flex: 1,
        textAlign: "center",
        fontFamily: "Poppins-SemiBold"
      }}>
        {label}: {value}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="black" />
    </View>
  );

  const [authToken, setAuthToken] = useState('');
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('@auth-token');
      setAuthToken(token)
    })()
  })

  const downloadReport = async () => {
    try {
      const response = await axios.get(`pembayaran/global/report?tahun=${selectedYear}&status=${selectedStatus}`, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Menambahkan Authorization header
        },
        responseType: 'arraybuffer', // Konfigurasi respons biner
      });

      const contentDisposition = response.headers['content-disposition'];
      let fileName = `Laporan Pembayaran Global ${selectedYear} - ${selectedStatus}.xlsx`; // Nama default jika tidak ada header

      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename="(.+?)"/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      // Tentukan path untuk menyimpan file
      const path = Platform.OS === "ios" ? `${RNFS.DocumentDirectoryPath}/${fileName}` : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      // Konversi buffer ke string ASCII untuk menyimpan file
      const buffer = new Uint8Array(response.data);
      const fileContent = buffer.reduce((data, byte) => data + String.fromCharCode(byte), '');

      // Menyimpan file ke perangkat lokal
      await RNFS.writeFile(path, fileContent, 'ascii');

      console.log('File berhasil diunduh dan disimpan di:', path);

      Toast.show({
        type: 'success',
        text1: 'Berhasil!',
        text2: 'Laporan berhasil diunduh',
      })
    } catch (error) {
      console.error('Error saat mengunduh file:', error);

      Toast.show({
        type: 'error',
        text1: 'Gagal!',
        text2: 'Tidak dapat mengunduh laporan',
      })
    }
  }

  const getStatusStyle = status => {
    switch (status) {
      case "pending":
        return {
          text: "text-blue-700",
          background: "bg-blue-50",
          border: "border-blue-50",
        };
      case "success":
        return {
          text: "text-green-600",
          background: "bg-green-100",
          border: "border-green-100",
        };
      case "failed":
        return {
          text: "text-red-700",
          background: "bg-red-100",
          border: "border-red-100",
        };
      default:
        return {
          text: "text-gray-700",
          background: "bg-gray-100",
          border: "border-gray-200",
        };
    }
  };

  const getStatusText = status => {
    switch (status) {
      case "pending":
        return "pending";
      case "success":
        return "success";
      case "failed":
        return "failed";
      default:
        return "Status Tidak Diketahui";
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const statusText = getStatusText(item.status);

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Virtual Account</Text>
            <Text className="text-md font-poppins-semibold text-black mb-4">
              {item.va_number || "Nomor VA Kosong"}
            </Text>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-5">
                <Text className="text-xs font-poppins-regular text-gray-500">Nama</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.nama || "-"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Jumlah Nominal</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {rupiah(item.jumlah)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Dibuat</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.tanggal_dibuat}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Kedaluwarsa</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.tanggal_exp_indo || "-"}
                </Text>
                {item.is_expired && (
                  <View className="bg-yellow-100 px-1.5 py-0.5 rounded-md mt-1 self-start">
                    <Text className="text-[11px] font-bold text-yellow-500">
                      Kedaluwarsa
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View className="flex-shrink-0 items-end">
            <View className={`rounded-md px-1.5 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
              <Text
                className={`text-[11px] font-bold text-right ${statusStyle.text}`}
                numberOfLines={2}
                ellipsizeMode="tail">
                {statusText}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const pickerStyle = {
    inputIOS: {
      paddingHorizontal: rem(1),
      paddingVertical: rem(0.75),
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 8,
      color: "black",
      backgroundColor: "white",
    },
    inputAndroid: {
      paddingHorizontal: rem(1),
      paddingVertical: rem(0.75),
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 8,
      color: "black",
      backgroundColor: "white",
    },
    iconContainer: {
      top: 12,
      right: 12,
    },
  };

  return (
     <View className="bg-[#ececec] w-full h-full">
          <View
            className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
            style={{ backgroundColor: "#fff" }}>
            <View className="flex-row items-center">
              <Ionicons
                name="arrow-back-outline"
                onPress={() => navigation.goBack()}
                size={25}
                color="#312e81"
              />
              <Text className="text-[20px] font-poppins-medium text-black ml-4">
                Global
              </Text>
            </View>
            <View className="bg-green-600 rounded-full">
              <Ionicons
                name="globe"
                size={18}
                color={"white"}
                style={{ padding: 5 }}
              />
            </View>
          </View>

        <View className= "p-4">
        <View className="flex-row">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <PickerButton
                label="Tahun"
                value={selectedYear}
              />
            </View>
          </MenuView>

          <MenuView
            title="Pilih Status"
            onPressAction={handleStatusChange}
            actions={statusOptions.map(option => ({
              id: option.id,
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <PickerButton
                label="Status"
                value={statusOptions.find(opt => opt.id === selectedStatus)?.title}
              />
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
                onPress={downloadReport}
                className="flex-1 mr-2 bg-green-500 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-poppins-medium">Ya, Download</Text>
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
          url="/pembayaran/global"
          payload={{
            status: selectedStatus,
            tahun: selectedYear,
            page: 1,
            per: 10,
          }}
          renderItem={renderItem}
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
          bottom: 15,
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

        <FontAwesome5
          name="file-excel"
          size={20}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
};

export default Global;