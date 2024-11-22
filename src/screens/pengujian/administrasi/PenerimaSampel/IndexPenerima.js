  import axios from "@/src/libs/axios";
import React, { useState, useEffect, useRef } from "react";
import {
  FlatList, Text, View, ActivityIndicator, Modal, Button, Alert, TouchableOpacity,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { MenuView } from "@react-native-menu/menu";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import HorizontalFilterMenu from "@/src/screens/components/HorizontalFilterMenu";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MouseButton, TextInput } from "react-native-gesture-handler";
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS, { downloadFile } from 'react-native-fs';
import Toast from 'react-native-toast-message';

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const penerimaOptions = [
  { id: 1, name: "Menunggu Konfirmasi" },
  { id: 3, name: "Telah Konfirmasi" },
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

const PenerimaSampel = ({ navigation }) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const filterOptions = generateYears();
  const [selectedPenerima, setSelectedPenerima] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deskripsi, setDeskripsi] = useState("");
  const paginateRef = useRef();
  const [previewReport, setPreviewReport] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  const kembali = () => {
    simpanRevisi();
    setModalVisible(false);
  };

  const simpanRevisi = async () => {
    if (selectedItem && selectedItem.uuid) {
      const response = await axios.post(
        `/administrasi/penerima-sample/${selectedItem.uuid}/revisi`,
        {
          keterangan_revisi: deskripsi,
        },
      );
    }
  };

  const handleShowPdf = async (item, reportType) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      if (!authToken) {
        throw new Error('Authentication token not found');
      }

      const url = `${APP_URL}/api/v1/report/${item.uuid}/${reportType}?token=${authToken}`;
      setReportUrl(url);
      setOpenModal(true);
    } catch (error) {
      console.error('Error handling PDF display:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat membuka PDF.');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const fileName = `LHU_${Date.now()}.pdf`;

      const downloadPath = Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: reportUrl,
        toFile: downloadPath,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        if (Platform.OS === 'android') {
          await RNFS.scanFile(downloadPath);
        }

        // Show toast message for success
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `PDF Berhasil Diunduh. ${Platform.OS === 'ios' ? 'You can find it in the Files app.' : `Saved as ${fileName} in your Downloads folder.`}`,
        });

      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);

      // Show toast message for error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };


  const fetchPenerimaSample = async ({ queryKey }) => {
    const [_, search, year] = queryKey;
    const response = await axios.post("/administrasi/penerima-sample", {
      search,
      tahun: year,
      status: 0,
      page: 1,
      per: 10,
    });
    return response.data.data;
  };

  const { data, isLoading: isLoadingData } = useQuery(
    ["penerima-sample", debouncedSearchQuery, selectedYear],
    fetchPenerimaSample,
    {
      onSuccess: data => console.log(data),
      onError: error => console.error(error),
    },
  );

  const renderItem = ({ item }) => {
    const isDiterima = item.kesimpulan_permohonan;

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs text-gray-500 font-poppins-regular">Kode</Text> 
            <Text className="text-md text-black font-poppins-semibold mb-3">{item.kode}</Text>

          <Text className="text-xs text-gray-500 font-poppins-regular">Pelanggan</Text> 
            <Text className="text-md text-black font-poppins-semibold mb-3">{item.permohonan.user.nama}</Text>

            <Text className="text-xs text-gray-500 font-poppins-regular">Titik Uji/Lokasi</Text> 
            <Text className="text-md text-black font-poppins-semibold mb-3">{item.lokasi}</Text>

            <Text className="text-xs text-gray-500 font-poppins-regular">Diterima Pada</Text> 
            <Text className="text-md text-black font-poppins-semibold mb-1">{item.tanggal_diterima}</Text>
          </View>
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md p-2 max-w-[120px] mb-2">
              <Text className="text-[10px] text-indigo-600 font-poppins-semibold text-right">
                {item.text_status}
              </Text>
            </View>
          </View>
        </View>
        <View className="h-[1px] bg-gray-300 my-3" />
        <View className="flex-row flex-wrap  justify-end gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("DetailPenerima", { uuid: item.uuid })}
            className="bg-indigo-900 px-3 py-2 rounded-md"
          >
            <View className="flex-row">
              <Ionicons name="eye-outline" size={15} color="white" style={{ marginRight: 5 }} />
              <Text className="text-white font-poppins-medium text-[11px]">Detail</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setSelectedItem(item);
              setModalVisible(true);
            }}
            className="bg-amber-500 px-3 py-2 rounded-md"
          >
            <View className="flex-row">
              <Ionicons name="pencil" size={15} color="white" style={{ marginRight: 5 }} />
              <Text className="text-white font-poppins-medium text-[11px]">Revisi</Text>
            </View>
          </TouchableOpacity>

          {selectedPenerima === 3 && ( // "Telah Konfirmasi"
            <TouchableOpacity
              onPress={() => handleShowPdf(item, 'tanda-terima')}
              className="bg-red-600 px-3 py-2 rounded-md"
            >
              <View className="flex-row">
                <FontAwesome5 name="file-pdf" size={15} color="white" style={{ marginRight: 5 }} />
                <Text className="text-white font-poppins-medium text-[11px]">Permohonan Pengujian</Text>
              </View>
            </TouchableOpacity>
          )}
          {selectedPenerima === 3 && ( // "Telah Konfirmasi"
            <>
              <TouchableOpacity
                onPress={() => handleShowPdf(item, 'pengamanan-sampel')}
                className="bg-red-600 px-3 py-2 rounded-md mt-2"
              >
                <View className="flex-row">
                  <FontAwesome5 name="file-pdf" size={15} color="white" style={{ marginRight: 5 }} />
                  <Text className="text-white font-poppins-medium text-[11px]">Pengaman Sampel</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  if (isLoadingData) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className=" p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-poppins-semibold text-black">Penerima Sampel</Text> 
              </View>
            </View>

            <View className="flex-row justify-center">
              <View style={{ flex: 1, marginVertical: 8 }}>
                <HorizontalFilterMenu
                  items={penerimaOptions}
                  selected={selectedPenerima}
                  onPress={(item) => setSelectedPenerima(item.id)}
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
                <View>
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
        url="/administrasi/penerima-sample"
        payload={{
          status: selectedPenerima,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="mb-14"
      />



      {/* Modal for Revisi */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text className="text-lg font-poppins-semibold">Revisi Data</Text>
            <Text className="font-poppins-semibold text-lg">
              {selectedItem ? selectedItem.kode : ""}
            </Text>
            <TextInput
              style={styles.longInput}
              placeholder="Masukkan Revisi"
              value={deskripsi}
              onChangeText={setDeskripsi}
              multiline={true} // Mengaktifkan input untuk beberapa baris
              numberOfLines={4} // Mengatur tinggi input untuk 4 baris
            />
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: '#fbbf24', borderRadius: 10 },
              ]}
              onPress={kembali}>
              <Text style={styles.buttonText}>Kirim Revisi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tanda Terima Report</Text>
            <Text style={styles.modalText}>Report URL: {reportUrl}</Text> {/* Menampilkan URL report */}

            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close Modal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={openModal}
        onRequestClose={() => setOpenModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">Preview PDF</Text>
              <TouchableOpacity onPress={() => {
                handleDownloadPDF();
                setModalVisible(false);
              }} className=" p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1 }}
              trustAllCerts={false}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity onPress={() => setOpenModal(false)} className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  button: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: 117,
    height: 45,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  longInput: {
    display: "flex",
    textAlign: "center", // Menempatkan placeholder dan teks di tengah horizontal
    textAlignVertical: "center",
    marginBottom: 30,
    marginTop: 20,
    borderWidth: 1, // Membuat kotakan
    borderColor: "#d1d5db", // Warna border abu-abu terang
    borderRadius: 10, // Membuat sudut border melengkung
    padding: 10, // Memberikan ruang di dalam kotakan
    fontSize: 16, // Ukuran teks lebih besar
    backgroundColor: "#ffffff", // Background putih untuk teks input
    marginVertical: 10, // Jarak vertikal antar elemen
    elevation: 3, // Memberikan efek bayangan pada Android
    maxWidth: "100%",
    width: 350,
  },
};

export default PenerimaSampel;
