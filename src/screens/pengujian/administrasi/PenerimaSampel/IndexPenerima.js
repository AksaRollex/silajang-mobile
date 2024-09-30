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
import { MenuView } from "@react-native-menu/menu";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MouseButton, TextInput } from "react-native-gesture-handler";

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [deskripsi, setDeskripsi] = useState("");
  const paginateRef = useRef();
  const [previewReport, setPreviewReport] = useState(false);
  const [reportUrl, setReportUrl] = useState(false);

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

  const dropdownOptions = (item) => {
    const options = [
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
    ];

    // Menambahkan opsi "Permohonan Pengujian" dan "Pengamanan Sampel" jika status bukan 1
    if (item.status !== 1) {
      options.push(
        {
          id: "Permohonan Pengujian",
          title: "Permohonan Pengujian",
          action: () => handleAction(item.uuid),
        },
        {
          id: "Pengamanan Sampel",
          title: "Pengamanan Sampel",
          action: () => handleAction(item.uuid),
        }
      );
    }
    return options; // Return the options to use in rendering
  };

  const handleAction = (uuid) => {
      if (previewReport) {
        const url = `/api/v1/report/${uuid}/tanda-terima?token=${localStorage.getItem('auth_token')}`;
        setReportUrl(url);
        setModalVisible(true);
      } else {
        const downloadUrl = `/report/${uuid}/tanda-terima`;
        console.log('Downloading report from: ', downloadUrl);
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
        <View className="flex-row justify-between items-center p-4 relative">
          <View className="flex-shrink mr-20">
            {isDiterima ? (
              <Text className="text-[18px] font-extrabold mb-3">
                {item.permohonan.user.nama}
              </Text>
            ) : (
              <Text className="text-[18px] font-extrabold mb-3">
                {item.permohonan.industri}
              </Text>
            )}

            <Text className="text-[14px] mb-2">{item.lokasi}</Text>
            <Text className="text-[14px] mb-2">
              Diterima pada:{" "}
              <Text className="font-bold ">{item.tanggal_pengambilan}</Text>
            </Text>
            <Text className="text-[14px] mb-2">
              Status: <Text className="font-bold">{item.text_status}</Text>
            </Text>
          </View>
          <View className="absolute right-1 flex-col items-center">
            <Text
              className={`text-[12px] text-white font-bold px-2 py-1 rounded-sm mb-3 ${
                isDiterima == 1
                  ? "bg-green-400"
                  : isDiterima == 2
                  ? "bg-red-500"
                  : "bg-purple-600"
              }`}>
              {isDiterima == 1
                ? "Diterima"
                : isDiterima == 2
                ? "Ditolak"
                : "Menunggu"}
            </Text>
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
      <View className="bg-white p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold">Penerima Sampel</Text>
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
                shouldOpenOnLongPress={false}>
                <View>
                  <MaterialCommunityIcons
                    name="filter-menu-outline"
                    size={24}
                    color="white"
                    style={{
                      backgroundColor: "#312e81",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  />
                </View>
              </MenuView>
            </View>

            <View className="flex-row items-start space-x-2 mt-4">
              <HorizontalScrollMenu
                items={pengambilOptions}
                selected={selectedPengambil}
                onPress={item => setSelectedPengambil(item.id)}
                itemWidth={185}
                scrollAreaStyle={{ height: 30, justifyContent: "flex-start" }}
                activeBackgroundColor={"#312e81"}
                buttonStyle={{
                  marginRight: 10,
                  borderRadius: 20,
                  justifyContent: "flex-start",
                }}
              />
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
