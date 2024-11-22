import axios from "@/src/libs/axios";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FlatList,
  Text,
  View,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import FontIcon from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import { MenuView } from "@react-native-menu/menu";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import HorizontalFilterMenu from "@/src/screens/components/HorizontalFilterMenu";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import DocumentPicker from "react-native-document-picker";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";
import { API_URL } from "@env";
import { APP_URL } from "@env";

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

const HasilUjis = ({ navigation, route }) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedCetak, setSelectedCetak] = useState(1);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [revisiNote, setRevisiNote] = useState("");
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const dropdownOptions = [];

  const handlePreviewLHU = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`,
    );
    setModalVisible(true);
  };
  const handleFilePicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setSelectedFile(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error("Error picking document:", err);
        Alert.alert("Error", "Failed to pick document");
      }
    }
  };

  const handleUploadPDF = async () => {
    // console.log("item: ", item);
    try {
      if (!selectedFile) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a PDF file first",
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });
      const response = await axios.post(
        `${API_URL}/administrasi/${currentItem.uuid}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSelectedFile(null);
      setUploadModalVisible(false);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "File berhasil diupload",
      });

      paginateRef.current?.refetch();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to upload file",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `LHU_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: reportUrl,
        toFile: downloadPath,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        if (Platform.OS === "android") {
          await RNFS.scanFile(downloadPath);
        }

        // Show toast message for success
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `PDF Berhasil Diunduh. ${
            Platform.OS === "ios"
              ? "You can find it in the Files app."
              : `Saved as ${fileName} in your Downloads folder.`
          }`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);

      // Show toast message for error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const fetchCetak = async ({ queryKey }) => {
    const [_, search, year] = queryKey;
    const response = await axios.post("/administrasi/cetak-lhu", {
      search,
      tahun: year,
      status: 5,
      page: 1,
      per: 10,
    });
    return response.data.data;
  };

  const renderItem = ({ item }) => {
    const canUpload = selectedCetak === 0 && item.can_upload === 1;
    const showPreview = selectedCetak !== 0 || item.status === 5;

    return (
      <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
            <Text className="text-md font-poppins-semibold text-black mb-2">
              {item.kode}
            </Text>
            <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
            <Text className="text-md font-poppins-semibold text-black mb-2">
              {item.permohonan.user.nama}
            </Text>
            <Text className="text-xs font-poppins-regular text-gray-500">Titik Uji/Lokasi</Text>
            <Text className="text-md font-poppins-semibold text-black mb-2">
              {item.lokasi}
            </Text>
            <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Diterima:{" "}</Text>
              <Text className="text-md font-poppins-semibold text-black mb-2">
                {item.tanggal_diterima}
              </Text>
          </View>
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md px-2 py-1 max-w-[120px] mb-2">
              <Text className="text-[11px] text-indigo-600 font-poppins-semibold text-right">
                {item.text_status}
              </Text>
            </View>
            <View className="my-2">
              {canUpload && (
                <TouchableOpacity
                  onPress={() => {
                    setCurrentItem(item);
                    setUploadModalVisible(true);
                  }}
                  className="mb-2">
                  <FontIcon
                    name="file-upload"
                    size={18}
                    color="white"
                    style={{
                      backgroundColor: "blue",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              )}
              {showPreview && (
                <TouchableOpacity
                  onPress={() => handlePreviewLHU(item)}
                  className="mb-2">
                  <FontIcon
                    name="file-pdf"
                    size={18}
                    color="white"
                    style={{
                      backgroundColor: "red",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {selectedFile && canUpload && (
          <Text className="text-[12px] mt-2">
            Selected: {selectedFile.name}
          </Text>
        )}
      </View>
    );
  };

  const payload = useMemo(() => {
    return {
      status: selectedCetak === 0 ? [-1, 5] : 5,
      tahun: selectedYear,
      ...(selectedCetak === 0 && { can_upload: 1 }),
    };
  }, [selectedCetak, selectedYear]);

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="p-3">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-poppins-semibold text-black">Cetak LHU</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View style={{ flex: 1, marginVertical: 8 }}>
                <HorizontalFilterMenu
                  items={cetakOptions}
                  selected={selectedCetak}
                  onPress={(item) => setSelectedCetak(item.id)}
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
                <View style={{ marginEnd: 5 }}>
                  <MaterialCommunityIcons name="filter-menu-outline" size={24} color="white" style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }} />
                </View>
              </MenuView>
            </View>

           
          </View>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/administrasi/cetak-lhu"
        payload={payload}
        renderItem={renderItem}
      />

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">Preview Pdf</Text>
              <TouchableOpacity
                onPress={() => {
                  handleDownloadPDF();
                  setModalVisible(false);
                }}
                className=" p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1 }}
              trustAllCerts={false}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={uploadModalVisible}
        onRequestClose={() => {
          setUploadModalVisible(false);
          setSelectedFile(null);
        }}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-[#ffffff] rounded-lg w-[90%] p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-poppins-semibold text-black">Upload File</Text>
              <TouchableOpacity
                onPress={() => {
                  setUploadModalVisible(false);
                  setSelectedFile(null);
                }}>
                <AntDesign name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedFile ? (
              <View className="mb-4">
                <View className="bg-[#f8f8f8] p-2 rounded-lg shadow">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      <Text className="text-sm mb-1">Selected File:</Text>
                      <Text className="text-sm font-poppins-semibold">
                        {selectedFile.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFile(null)}
                      className="bg-gray-200 p-2 rounded-full">
                      <AntDesign name="close" size={16} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={handleUploadPDF}
                    className="bg-indigo-600 px-4 py-2 rounded">
                    <Text className="text-white font-poppins-semibold">Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-sm mb-4">
                  Silahkan pilih file PDF yang akan diupload
                </Text>
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={handleFilePicker}
                    className="bg-indigo-600 px-4 py-2 rounded">
                    <Text className="text-white font-poppins-semibold">Pilih File</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default HasilUjis