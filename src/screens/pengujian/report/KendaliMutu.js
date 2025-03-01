import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from '@/src/libs/axios';
import { APP_URL } from "@env";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { useHeaderStore } from '../../main/Index';
import { TextFooter } from "@/src/screens/components/TextFooter";


const TTEModal = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tanda_tangan_id: '',
    passphrase: '',
  });
  const [ttds, setTtds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])


  useEffect(() => {
    const fetchTTDs = async () => {
      if (!visible) return;

      setIsLoading(true);
      try {
        const response = await axios.get('/konfigurasi/tanda-tangan');
        if (response.data?.data) {
          setTtds(response.data.data.map(ttd => ({
            id: ttd.id,
            text: `${ttd.bagian} - ${ttd.user?.nama} (${ttd.user?.nik})`
          })));
        }
      } catch (error) {
        console.error('Error fetching TTDs:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.response?.data?.message || 'Failed to fetch TTD options',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTTDs();
  }, [visible]);

  const handleSubmit = async () => {
    if (!formData.tanda_tangan_id || !formData.passphrase) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Mohon lengkapi semua field yang diperlukan',
      });
      return;
    }

    onSubmit(formData);
  };

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-lg w-[90%] p-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-poppins-semibold text-black">Ajukan TTE Kendali Mutu</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-poppins-bold mb-2 text-black">Tanda Tangan<Text className="text-red-500">*</Text></Text>
            {isLoading ? (
              <View className="border border-gray-300 rounded-md p-3">
                <Text className="font-poppins-semibold text-black">Loading TTD options...</Text>
              </View>
            ) : (
              <MenuView
                title="Pilih TTD"
                actions={ttds.map(ttd => ({
                  id: ttd.id.toString(),
                  title: ttd.text,
                }))}
                onPressAction={({ nativeEvent }) => {
                  setFormData(prev => ({
                    ...prev,
                    tanda_tangan_id: nativeEvent.event
                  }));
                }}
                shouldOpenOnLongPress={false}
              >
                <View className="border border-gray-300 rounded-md p-3">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-poppins-semibold text-black">
                      {ttds.find(t => t.id.toString() === formData.tanda_tangan_id)?.text || 'Pilih TTD'}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                  </View>
                </View>
              </MenuView>
            )}
          </View>

          <View className="mb-4">
            <Text className="text-sm text-black font-poppins-bold mb-2">
              Passphrase<Text className="text-red-500">*</Text>
            </Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-md p-3 font-poppins-medium w-full pr-12 text-black"
                secureTextEntry={!showPassword}
                value={formData.passphrase}
                onChangeText={(text) => setFormData(prev => ({ ...prev, passphrase: text }))}
                placeholder="Masukkan passphrase"
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="absolute right-4 top-4"
              >
                {showPassword ? (
                  <Ionicons name="eye-outline" size={20} color="grey" />
                ) : (
                  <Ionicons name="eye-off-outline" size={20} color="grey" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-indigo-600 px-4 py-2 rounded-md flex-row items-center"
            >
              <Ionicons name="document-text-outline" size={20} color="white" className="mr-2" />
              <Text className="text-white font-poppins-semibold ml-2">Kirim</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const KendaliMutu = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [tteModalVisible, setTteModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

  const [pdfError, setPdfError] = useState(false);
    const [pdfLoaded, setPdfLoaded] = useState(false);
  
    useEffect(() => {
      if (modalVisible) {
        setPdfLoaded(false);
        setPdfError(false);
      }
    }, [modalVisible]);

  const [paginatePayload, setPaginatePayload] = useState({
    status: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    tahun: currentYear.toString(),
    bulan: currentMonth.toString(),
    page: 1,
    per: 10,
  });

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

  const handleTTESubmit = async (formData) => {
    try {
      const response = await axios.post(`/kendali-mutu/${selectedItem}/tte`, formData);

      if (response.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'TTE berhasil diajukan',
        });
        setTteModalVisible(false);
        paginateRef.current?.refetch();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Gagal mengajukan TTE',
      });
    }
  };

  const handlePreviewPDF = async (uuid) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      setReportUrl(`${APP_URL}/api/v1/report/${uuid}/kendali-mutu?token=${authToken}`);
      setModalVisible(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal membuka preview PDF',
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const fileName = `KendaliMutu_${Date.now()}.pdf`;

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

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        if (Platform.OS === 'android') {
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
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const CardKendaliMutu = ({ item }) => {
    if (!item) return null;
  
    return (
      <View
        className="my-4 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row items-center">
          <View className="" style={{ width: "90%" }}>
            <View className="flex-col space-y-2">
              {/* Kode and Pelanggan row */}
              <View className="flex-row justify-between">
                <View style={{ width: '48%' }}>
                  <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
                  <Text className="text-md font-poppins-semibold text-black mb-2">
                    {item.kode || '-'}
                  </Text>
                </View>
  
                <View style={{ width: '48%' }}>
                  <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
                  <Text className="text-md font-poppins-semibold text-black"
                    numberOfLines={2}
                    style={{ flexWrap: 'wrap' }}>
                    {item.permohonan?.user?.nama || '-'}
                  </Text>
                </View>
              </View>
  
              {/* Lokasi and Status row */}
              <View className="flex-row justify-between">
                <View style={{ width: '48%' }}>
                  <Text className="text-xs font-poppins-regular text-gray-500">Lokasi</Text>
                  <Text className="text-md font-poppins-semibold text-black">
                    {item.lokasi || '-'}
                  </Text>
                </View>
  
                <View style={{ width: '48%' }}>
                  <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Status</Text>
                  <View className="bg-indigo-100 self-start rounded-md px-2 py-1">
                    <Text className="text-[11px] font-poppins-semibold text-indigo-600">
                      {item.text_status || '-'}
                    </Text>
                  </View>
                </View>
              </View>
  
              {/* Tanggal Selesai and Status TTE row */}
              <View className="flex-row justify-between">
                <View style={{ width: '48%' }}>
                  <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Selesai</Text>
                  <Text className="text-md font-poppins-semibold text-black">
                    {item.tanggal_selesai || '-'}
                  </Text>
                </View>
  
                <View style={{ width: '48%' }}>
                  <Text className="text-xs font-poppins-regular text-gray-500">Status TTE</Text>
                  {item.status_tte_kendali_mutu === 1 ? (
                    <View className="bg-green-100 self-start rounded-full px-3 py-1">
                      <Text className="text-[12px] font-poppins-semibold text-green-800">Berhasil</Text>
                    </View>
                  ) : item.status_tte_kendali_mutu === 0 ? (
                    <View className="bg-red-100 self-start rounded-full px-3 py-1">
                      <Text className="text-[12px] font-poppins-semibold text-red-800">Gagal</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        </View>
  
        {/* Horizontal Separator */}
        <View className="h-[1px] bg-gray-300 my-4" />
  
        <View className="flex-row justify-end space-x-2">
          {!item.status_tte_kendali_mutu && (
            <TouchableOpacity
              onPress={() => {
                setSelectedItem(item.uuid);
                setTteModalVisible(true);
              }}
              className="bg-green-600 p-2 rounded-md flex-row items-center"
            >
              <FontAwesome name="file-text-o" size={16} color="white" />
              <Text className="ml-2 text-white text-[13px] font-poppins-semibold">
                Ajukan TTE
              </Text>
            </TouchableOpacity>
          )}
  
          <TouchableOpacity
            onPress={() => handlePreviewPDF(item.uuid)}
            className="bg-red-100 p-2 rounded-md flex-row items-center"
          >
            <FontAwesome name="file-pdf-o" size={16} color="#dc2626" />
            <Text className="ml-2 text-red-600 text-[13px] font-poppins-semibold">
              PDF
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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
          <Text className="text-[20px] font-poppins-medium text-black ml-4">Kendali Mutu</Text>
        </View>
        <View className="bg-lime-600 rounded-full">
          <Ionicons
            name="create"
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
            onPressAction={({ nativeEvent }) => {
              const newYear = nativeEvent.event;
              setSelectedYear(newYear);
              setPaginatePayload(prev => ({
                ...prev,
                tahun: newYear,
                page: 1
              }));
            }}
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
            onPressAction={({ nativeEvent }) => {
              const newMonth = nativeEvent.event;
              setSelectedMonth(newMonth);
              setPaginatePayload(prev => ({
                ...prev,
                bulan: newMonth,
                page: 1
              }));
            }}
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

      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/report"
          payload={paginatePayload}
          renderItem={CardKendaliMutu}
          onError={(error) => console.error('Paginate error:', error)}
          className="bottom-2"
        />
        <View className="bottom-2">
          <TextFooter />
        </View>
      </ScrollView>

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
                className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>

            {!pdfLoaded && !pdfError && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor : "#ececec"  }}>
                <ActivityIndicator size="large" color="#312e81" style={{ top:180 }} />
                <Text className="mt-2 text-black font-poppins-medium" style={{ top:175 }}>Memuat PDF...</Text>
              </View>
            )}

            {!pdfError && (
              <Pdf
                key={reportUrl}
                source={{ uri: reportUrl, cache: true }}
                style={{
                  flex: 1,
                }}
                trustAllCerts={false}
                onLoadComplete={(numberOfPages) => {
                  setPdfLoaded(true);
                  console.log(`Number Of Page: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`Current page ${page}`);
                }}
                onError={(error) => {
                  setPdfError(true);
                  setPdfLoaded(false);
                  console.log('PDF loading error:', error);
                }}
                />
              )}


            {pdfError && (
              <View className="flex-1 justify-center items-center self-center p-4">
                <Text className="text-md text-black font-poppins-medium">PDF Tidak Ditemukan</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setPdfError(false);
                  }}
                  className="bg-red-100 py-2 px-5 rounded mt-1 self-center">
                  <Text className="text-red-500 font-poppins-medium">Tutup</Text>
                </TouchableOpacity>
              </View>
            )}

            {pdfLoaded && (
              <View className="flex-row justify-between m-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                  <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <TTEModal
        visible={tteModalVisible}
        onClose={() => setTteModalVisible(false)}
        onSubmit={handleTTESubmit}
      />
    </View>
  );
};

export default KendaliMutu;