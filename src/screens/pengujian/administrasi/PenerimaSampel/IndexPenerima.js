import axios from "@/src/libs/axios";
import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
  TouchableOpacity,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import { MenuView } from "@react-native-menu/menu";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
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

const pengambilOptions = [
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
  const [selectedPengambil, setSelectedPengambil] = useState(1);
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

  const dropdownOptions = (item) => [
    {
      id: "Detail",
      title: "Detail",
      action: () => navigation.navigate("DetailPenerima", { uuid: item.uuid }),
    },
    {
      id: "Revisi",
      title: "Revisi",
      action: () => {
        setSelectedItem(item);
        setModalVisible(true);
      },
    },
    {
      id: "Permohonan Pengujian",
      title: "Permohonan Pengujian",
      action: () => handleShowPdf(item, 'tanda-terima'),
    },
    {
      id: "Pengamanan Sampel",
      title: "Pengamanan Sampel",
      action: () => handleShowPdf(item, 'pengamanan-sampel'),
    },
  ];

  // const handleAction = (uuid) => {
  //     if (previewReport) {
  //       const url = `/api/v1/report/${uuid}/tanda-terima?token=${localStorage.getItem('auth_token')}`;
  //       setReportUrl(url);
  //       setModalVisible(true);
  //     } else {
  //       const downloadUrl = `/report/${uuid}/tanda-terima`;
  //       console.log('Downloading report from: ', downloadUrl);
  //     }
    
  // };

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
            <Text className="text-[18px] font-extrabold mb-2">{item.permohonan.user.nama}</Text>
            <Text className="text-[18px] font-extrabold mb-2">{item.kode}</Text>
            <Text className="text-[15px] mb-2">
              Titik Uji/Lokasi: <Text className="font-bold">{item.lokasi}</Text>
            </Text>
            <Text className="text-[15px] mb-2">
              Diterima pada: <Text className="font-bold">{item.tanggal_diterima}</Text>
            </Text>
          </View>
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md p-2 max-w-[120px] mb-2">
              <Text className="text-[12px] text-indigo-600 font-bold text-right">
                {item.text_status}
              </Text>
            </View>
            <View className="my-2 ml-10">
            <MenuView
                title="dropdownOptions"
                actions={dropdownOptions(item)}
                onPressAction={({ nativeEvent }) => {
                  const selectedOption = dropdownOptions(item).find(option => option.title === nativeEvent.event);
                  if (selectedOption) {
                    selectedOption.action();
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
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="p-3">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold">Penerima Sampel</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View className="mt-3 ml-[-10] mr-2">
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
                    setSelectedYear(selectedOption.title)
                    // console.log(selectedOption.title)
                  }
                }}
                shouldOpenOnLongPress={false}
                
              >
                <View style={{ marginEnd: 60 }}>
                  <MaterialCommunityIcons name="filter-menu-outline" size={24} color="white" style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }} />
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
          status: selectedPengambil,
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
            <Text className="text-lg font-bold">Revisi Data</Text>
            <Text className="font-bold text-lg">
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
              <Text className="text-lg font-bold text-black">Preview PDF</Text>
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
                <Text className="text-white font-bold text-center">Tutup</Text>
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
