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
  TextInput,
  Pressable,
  BackHandler,
} from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import FontIcon from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
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
import FileViewer from 'react-native-file-viewer';
import { number } from "yup";
import { Platform } from 'react-native';

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
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [selectedRevisionItem, setSelectedRevisionItem] = useState(null);
  const [tteModalVisible, setTteModalVisible] = useState(false);
  const [formTte, setFormTte] = useState({
    tanda_tangan_id: "",
    passphrase: "",
    tipe: "1", // default value, adjust as needed
  });
  const [previewReport, setPreviewReport] = useState(true);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [activeItem, setActiveItem] = useState(null);

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
        
        // Use FileViewer with more comprehensive error handling
        try {
          await FileViewer.open(downloadPath, {
            showOpenWithDialog: false,
            mimeType: 'application/pdf'
          });
        } catch (openError) {
          console.log('Error opening file with FileViewer:', openError);
          
          // Fallback for Android using Intents
          if (Platform.OS === 'android') {
            try {
              const intent = new android.content.Intent(
                android.content.Intent.ACTION_VIEW
              );
              intent.setDataAndType(
                android.net.Uri.fromFile(new java.io.File(downloadPath)), 
                'application/pdf'
              );
              intent.setFlags(
                android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP | 
                android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
              );
              
              await ReactNative.startActivity(intent);
            } catch (intentError) {
              console.log('Intent fallback failed:', intentError);
              
              // Last resort: show file location
              Toast.show({
                type: "info",
                text1: "PDF Downloaded",
                text2: `File saved at: ${downloadPath}`,
              });
            }
          } else {
            // Fallback for iOS
            Toast.show({
              type: "info", 
              text1: "PDF Downloaded",
              text2: `File saved at: ${downloadPath}`,
            });
          }
        }
        
        // Always show success toast
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `PDF Berhasil Diunduh`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const handleRevision = async () => {
    try {
      if (!revisionNote.trim()) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Keterangan revisi tidak boleh kosong",
        });
        return;
      }

      const response = await axios.post(
        `/administrasi/${selectedRevisionItem.uuid}/cetak-lhu/revisi`,
        { keterangan_revisi: revisionNote }
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Berhasil menyimpan revisi",
      });

      setRevisionModalVisible(false);
      setRevisionNote("");
      setSelectedRevisionItem(null);
      paginateRef.current?.refetch();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Gagal menyimpan revisi",
      });
    }
  };

  const handleTteLhu = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const encodedPassphrase = btoa(formTte.passphrase); // Base64 encode passphrase

      setTteModalVisible(false);

      if (previewReport) {
        // For preview in modal
        const newReportUrl = `${APP_URL}/api/v1/report/${currentItem.uuid}/lhu/tte?token=${authToken}&tanda_tangan_id=${formTte.tanda_tangan_id}&passphrase=${encodedPassphrase}&tipe=${formTte.tipe}`;
        setReportUrl(newReportUrl);
        setModalVisible(true);
      } else {
        // For direct download
        try {
          const fileName = `LHU_TTE_${Date.now()}.pdf`;
          const downloadPath =
            Platform.OS === "ios"
              ? `${RNFS.DocumentDirectoryPath}/${fileName}`
              : `${RNFS.DownloadDirectoryPath}/${fileName}`;

          const downloadUrl = `${APP_URL}/api/v1/report/${currentItem.uuid}/lhu/tte?tanda_tangan_id=${formTte.tanda_tangan_id}&passphrase=${encodedPassphrase}&tipe=${formTte.tipe}`;

          const options = {
            fromUrl: downloadUrl,
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

            Toast.show({
              type: "success",
              text1: "Success",
              text2: `PDF Berhasil Diunduh dengan TTE. ${
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
          Toast.show({
            type: "error",
            text1: "Error",
            text2: `PDF gagal diunduh: ${error.message}`,
          });
        }
      }
    } catch (error) {
      console.error("TTE error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to process TTE",
      });
    }
  };

  const handleDownloadWord = async (item) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `LAPORAN-HASIL-PENGUJIAN-${item.kode}.docx`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const downloadUrl = `${APP_URL}/api/v1/report/${item.uuid}/lhu/word`;

      const options = {
        fromUrl: downloadUrl,
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

        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Word document berhasil diunduh. ${
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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Word document gagal diunduh: ${error.message}`,
      });
    }
  };

  const PrintOptionsDropdown = ({ item }) => {
    return (
      <View className="relative">
        <TouchableOpacity
          onPress={() => {
            setActiveItem(activeItem === item.uuid ? null : item.uuid);
            setShowPrintOptions(!showPrintOptions);
          }}
          className="flex-row items-center p-2 bg-green-100 rounded-md mr-2"
        >
          <FontIcon name="file-contract" size={16} color="#22c55e" />
          <Text className="ml-2 text-green-500 text-[13px] font-poppins-semibold">
            Cetak LHU
          </Text>
          <MaterialIcons 
            name={activeItem === item.uuid ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
            size={20} 
            color="#059669" 
          />
        </TouchableOpacity>

        {activeItem === item.uuid && (
          <View className="absolute left-0 bg-white rounded-lg shadow-lg z-50 w-40 ">
            <TouchableOpacity
              onPress={() => {
                setActiveItem(null);
                if (previewReport) {
                  const getPreviewUrl = async () => {
                    const authToken = await AsyncStorage.getItem("@auth-token");
                    setReportUrl(
                      `${APP_URL}/api/v1/report/${item.uuid}/cetak-lhu?token=${authToken}`
                    );
                    setModalVisible(true);
                  };
                  getPreviewUrl();
                } else {
                  handleDownloadPDF();
                }
              }}
              className="flex-row items-center p-2 border-b border-gray-100"
            >
              <FontIcon name="file-pdf" size={16} color="#dc2626" className="mr-2" />
              <Text className="text-red-500 text-[12px] font-poppins-semibold ml-2">
                PDF
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setActiveItem(null);
                handleDownloadWord(item);
              }}
              className="flex-row items-center p-2"
            >
              <FontIcon name="file-word" size={16} color="#2563eb" className="mr-2" />
              <Text className="text-blue-500 text-[12px] font-poppins-semibold ml-2">
                WORD
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
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
    const showPreview = selectedCetak !== 0 || item.status === 8;
    const canRevision = selectedCetak === 0; 
    const canPrev = selectedCetak === 0;
    // const canTte = selectedCetak === 0;

    return (
      <View className="my-3 bg-white rounded-lg border-t-[6px] border-indigo-900 p-4 mx-2" style={{ 
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      }}>
        <View className="border-b border-gray-100 pb-3 mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-md font-poppins-semibold text-black">{item.kode}</Text>
            <View className="flex-shrink-0 items-end">
              <View className="bg-indigo-100 rounded-md px-2 py-1 max-w-[120px] mb-2">
                <Text className="text-[10px] text-indigo-600 font-poppins-semibold text-right">
                  {item.text_status}
                </Text>
              </View> 
            </View>
          </View>
          <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
          <Text className="text-md font-poppins-semibold text-black mb-4">
            {item.permohonan.user.nama}
          </Text>
          <Text className="text-xs font-poppins-regular text-gray-500">Titik Uji/Lokasi</Text>
          <Text className="text-[14px] font-poppins-semibold text-black">
            {item.lokasi}
          </Text>
        </View>

        <View className="border-b border-gray-100 pb-3 mb-3">
          <View className="mb-2">
            <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Diterima</Text>
            <Text className="text-md font-poppins-semibold text-black">
              {item.tanggal_diterima}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-end pt-2">
          {canPrev&&(
            <PrintOptionsDropdown item={item} />
          )}
          {canRevision && (
            <TouchableOpacity
              onPress={() => {
                setSelectedRevisionItem(item);
                setRevisionModalVisible(true);
              }}
              className="flex-row items-center p-2 bg-yellow-100 rounded-md mr-2"
            >
              <FontIcon name="pencil-alt" size={16} color="#facc15" />
              <Text className="ml-2 text-yellow-400 text-[13px] font-poppins-semibold">
                Revisi
              </Text>
            </TouchableOpacity>
          )}

          {/* {canTte && (
            <TouchableOpacity
              onPress={() => {
                setCurrentItem(item);
                setTteModalVisible(true);
              }}
              className="flex-row items-center p-2 bg-green-100 rounded-md mr-2"
            >
              <FontIcon name="signature" size={16} color="#059669" />
              <Text className="ml-2 text-green-600 text-[13px] font-poppins-semibold">
                TTE
              </Text>
            </TouchableOpacity>
          )} */}


          {canUpload && (
            <TouchableOpacity
              onPress={() => {
                setCurrentItem(item);
                setUploadModalVisible(true);
              }}
              className="flex-row items-center p-2 bg-indigo-100 rounded-md mr-2"
            >
              <FontIcon name="file-upload" size={16} color="#4f46e5" />
              <Text className="ml-2 text-indigo-600 text-[13px] font-poppins-semibold">
                Upload
              </Text>
            </TouchableOpacity>
          )}
    
          {showPreview && (
            <TouchableOpacity
              onPress={() => handlePreviewLHU(item)}
              className="flex-row items-center p-2 bg-red-100 rounded-md"
            >
              <FontIcon name="file-pdf" size={16} color="#ef4444" />
              <Text className="ml-2 text-red-500 text-[13px] font-poppins-semibold">
                Preview LHU
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (activeItem) {
          setActiveItem(null);
          return true;
        }
        return false;
      }
    );

    return () => backHandler.remove();
  }, [activeItem]);

  const payload = useMemo(() => {
    return {
      status: selectedCetak === 0 ? [6, 7] : 8, // Updated to match web version status
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
                    setSelectedYear(selectedOption.title);
                  }
                }}
                shouldOpenOnLongPress={false}
              >
                <View style={{ marginEnd: 5 }}>
                  <MaterialCommunityIcons 
                    name="filter-menu-outline" 
                    size={24} 
                    color="white" 
                    style={{ 
                      backgroundColor: "#312e81", 
                      padding: 12, 
                      borderRadius: 8 
                    }} 
                  />
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
        animationType="fade"
        visible={revisionModalVisible}
        onRequestClose={() => {
          setRevisionModalVisible(false);
          setRevisionNote("");
          setSelectedRevisionItem(null);
        }}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-[#ffffff] rounded-lg w-[90%] p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-poppins-semibold text-black">
                Revisi LHU
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setRevisionModalVisible(false);
                  setRevisionNote("");
                  setSelectedRevisionItem(null);
                }}>
                <AntDesign name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm mb-2 text-gray-600">
                Keterangan Revisi
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                value={revisionNote}
                onChangeText={setRevisionNote}
                className="border border-gray-300 rounded-lg p-3 text-sm"
                placeholder="Masukkan keterangan revisi..."
                textAlignVertical="top"
              />
            </View>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => {
                  setRevisionModalVisible(false);
                  setRevisionNote("");
                  setSelectedRevisionItem(null);
                }}
                className="bg-gray-200 px-4 py-2 rounded">
                <Text className="text-gray-800 font-poppins-semibold">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRevision}
                className="bg-yellow-500 px-4 py-2 rounded">
                <Text className="text-white font-poppins-semibold">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={tteModalVisible}
        onRequestClose={() => {
          setTteModalVisible(false);
          setFormTte({
            tanda_tangan_id: "",
            passphrase: "",
            tipe: "1",
          });
        }}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-[#ffffff] rounded-lg w-[90%] p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-poppins-semibold text-black">
                Tanda Tangan Elektronik
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setTteModalVisible(false);
                  setFormTte({
                    tanda_tangan_id: "",
                    passphrase: "",
                    tipe: "1",
                  });
                }}>
                <AntDesign name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm mb-2 text-gray-600">
                Tanda Tangan ID
              </Text>
              <TextInput
                value={formTte.tanda_tangan_id}
                onChangeText={(text) => 
                  setFormTte(prev => ({...prev, tanda_tangan_id: text}))
                }
                className="border border-gray-300 rounded-lg p-3 text-sm"
                placeholder="Masukkan ID Tanda Tangan"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm mb-2 text-gray-600">
                Passphrase
              </Text>
              <TextInput
                value={formTte.passphrase}
                onChangeText={(text) => 
                  setFormTte(prev => ({...prev, passphrase: text}))
                }
                className="border border-gray-300 rounded-lg p-3 text-sm"
                placeholder="Masukkan Passphrase"
                secureTextEntry
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm mb-2 text-gray-600">
                Preview
              </Text>
              <TouchableOpacity
                onPress={() => setPreviewReport(!previewReport)}
                className="flex-row items-center"
              >
                <View className={`w-5 h-5 border rounded mr-2 ${previewReport ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                  {previewReport && <Feather name="check" size={16} color="white" />}
                </View>
                <Text>Preview sebelum download</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => {
                  setTteModalVisible(false);
                  setFormTte({
                    tanda_tangan_id: "",
                    passphrase: "",
                    tipe: "1",
                  });
                }}
                className="bg-gray-200 px-4 py-2 rounded">
                <Text className="text-gray-800 font-poppins-semibold">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTteLhu}
                className="bg-green-500 px-4 py-2 rounded">
                <Text className="text-white font-poppins-semibold">Proses</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {activeItem && (
        <Pressable
          className="absolute inset-0 z-40 bg-transparent"
          onPress={() => setActiveItem(null)}
        />
      )}

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
              activityIndicator={
                <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
                  <ActivityIndicator size={"large"} color={"#0000ff"}/>
                  <Text>Memuat Pdf....</Text>
                </View>
              }
              onLoadComplete={(numberOfPages) => {
                console.log(`Number Of Page: ${numberOfPages}`)
              }}
              onPageChanged={(page, numberOfPages) => {
                console.log(`Current page ${page}`)
              }}
              onError={(error) => {
                console.log('PDF loading error:', error);
              }}
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