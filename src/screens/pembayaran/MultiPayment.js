import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import axios from "@/src/libs/axios";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rupiah } from "@/src/libs/utils";
import { useHeaderStore } from "../main/Index";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { TextFooter } from "../components/TextFooter";
import FileViewer from 'react-native-file-viewer';
import Feather from "react-native-vector-icons/Feather";
import Pdf from "react-native-pdf";
import { APP_URL } from "@env";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";


const MultiPayment = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState("va");
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const { setHeader } = useHeaderStore();
  const [selectedItem, setSelectedItem] = useState(null);
  const [tteType, setTteType] = useState('system');
  const [previewReport, setPreviewReport] = useState(true);
  const [tteModalVisible, setTteModalVisible] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [pdfLoaded, setPdfLoaded] = useState(false);

  React.useLayoutEffect(() => {
    setHeader(false);

    return () => setHeader(true);
  }, []);

  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('@auth-token');
      setAuthToken(token);
    })();
  }, []);

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
  const handlePreviewSKRDPDF = async (item) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      
      setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/skrd?multi_payment=1&token=${authToken}`);
      setModalVisible(true);
    } catch (error) {
      console.error('Preview SKRD PDF error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Gagal memuat PDF SKRD',
      });
    }
  };

  const handleReport = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      
      if (previewReport) {
        // For preview in modal
        const baseUrl = `/api/v1/report/pembayaran/multi-payment`;
        const reportUrl = `${APP_URL}${baseUrl}?tahun=${selectedYear}&bulan=${selectedMonth}&type=${selectedType}&token=${authToken}`;
        
        setReportUrl(reportUrl);
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Report handling error:", error);
      Toast.show({
        type: "error", 
        text1: "Error",
        text2: "Gagal memuat laporan",
      });
    }
  };
  
  // Helper function to handle report download
  const handleDownloadReport = async (downloadUrl) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fullUrl = `${APP_URL}${downloadUrl}&token=${authToken}`;
      
      // Use React Native's Linking to open the URL in browser/download
      await Linking.openURL(fullUrl);
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal mengunduh laporan",
      });
    }
  };

  const handleTTESubmit = async (formData) => {
    try {
      // Convert formData to query parameters
      const queryParams = new URLSearchParams({
        tanda_tangan_id: formData.tanda_tangan_id,
        passphrase: formData.passphrase,
        tipe: formData.tipe
      }).toString();

      const response = await axios.get(`/report/${selectedItem}/kendali-mutu/tte?${queryParams}`);

      if (response.data?.success) {
        const authToken = await AsyncStorage.getItem('@auth-token');
        setReportUrl(`${APP_URL}/api/v1/report/${selectedItem}/lhu/tte?token=${authToken}&tanda_tangan_id=${formData.tanda_tangan_id}&passphrase=${btoa(formData.passphrase)}`);
        setModalVisible(true);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'TTE request submitted successfully',
        });
        setTteModalVisible(false);
        paginateRef.current?.refetch();
      }
    } catch (error) {
      console.error('Error submitting TTE request:', error.response);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to submit TTE request',
      });
    }
  };

  const TTEModal = ({ visible, onClose, onSubmit, type }) => {
    const [formData, setFormData] = useState({
      tanda_tangan_id: '',
      passphrase: '',
      tipe: type
    });
    const [ttds, setTtds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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
          console.error('Error fetching types:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: error.response?.data?.message || 'Failed to fetch type options',
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
              <Text className="text-lg font-poppins-semibold">Ajukan TTE</Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-poppins-bold mb-2 text-black">Tanda Tangan<Text className="text-red-500">*</Text></Text>
              {isLoading ? (
                <View className="border border-gray-300 rounded-md p-3">
                  <Text className="font-poppins-semibold text-black">Loading type options...</Text>
                </View>
              ) : (
                <MenuView
                  title="Pilih type"
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
                        {ttds.find(t => t.id.toString() === formData.tanda_tangan_id)?.text || 'Pilih type'}
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
  }

  const PreviewVerifikasi = async (item) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`);
      setModalVisible(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to preview LHU',
      });
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


  const months = [
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

  const types = [
    { id: "va", title: "Virtual Account" },
    { id: "qris", title: "QRIS" },
  ];

  const handleYearChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedYear(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleMonthChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedMonth(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleTypeChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedType(selectedId);
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

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <View
        onPress={() => navigation.navigate('MultiPaymentDetail', { uuid: item.uuid })}
        className="my-2 bg-white rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
            <Text className="text-md font-poppins-semibold text-black mb-4">
              {item.multi_payments?.map(mp => mp.titik_permohonan.kode).join(', ') || "-"}
            </Text>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-5">
                <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.multi_payments?.[0]?.titik_permohonan?.permohonan?.user?.nama || "-"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Total</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {rupiah(item.jumlah)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-poppins-regular text-gray-500">Metode</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.type === 'va' ? 'Virtual Account' : 'QRIS'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Bayar</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.tanggal_bayar || "-"}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-shrink-0 items-end">
            <View className={`rounded-md px-1.5 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
              <Text
                className={`text-[11px] font-bold text-right ${statusStyle.text}`}
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.is_expired ? 'Kedaluwarsa' : item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>


        <View className="h-[1px] bg-gray-300 my-3" />

        <View className="flex-row justify-end mt-1 space-x-2">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => navigation.navigate('DetailMulti', { selected: item.uuid })}
              className="bg-indigo-500 px-3 py-2 rounded-md flex-row items-center">
              <MaterialIcons name="credit-card" size={13} color="white" />
              <Text className="text-white text-xs ml-1 font-poppins-medium">
                Detail
              </Text>
            </TouchableOpacity>

            <MenuView
              title="TTE SKRD"
              actions={[
                { id: 'apply', title: 'Ajukan TTE' }
              ]}
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'apply') {
                  setSelectedItem(item);
                  setTteModalVisible(true);
                }
              }}
            >
              <TouchableOpacity
                className="bg-indigo-700 px-3 py-2 rounded-md flex-row items-center"
              >
                <FontAwesome5 name="file-signature" size={13} color="white" />
                <Text className="text-white text-xs ml-1 font-poppins-medium">
                  TTE SKRD
                </Text>
                <MaterialIcons name="arrow-drop-down" size={16} color="white" />
              </TouchableOpacity>
            </MenuView>
          </View>
          <View className="flex-row justify-end">
            <MenuView
              title="PDF"
              actions={[
                { id: 'skrd', title: 'SKRD' },
              ]}
              onPressAction={({ nativeEvent }) => {
                if (nativeEvent.event === 'skrd') {
                  handlePreviewSKRDPDF({uuid : item.uuid});
                }
              }}
            >
              <TouchableOpacity className="bg-red-100 px-3 py-2 rounded-md flex-row items-center">
                <FontAwesome5 name="file-pdf" size={13} color="#ef4444" />
                <Text className="text-red-500 text-xs ml-1 font-poppins-medium">
                  PDF
                </Text>
                <MaterialIcons name="arrow-drop-down" size={16} color="#ef4444" />
              </TouchableOpacity>
            </MenuView>
          </View>
        </View>

      </View>
    );
  };

  const downloadReport = async () => {
    try {
      const response = await axios.get(`/pembayaran/multi-payment/report?tahun=${selectedYear}&bulan=${selectedMonth}&type=${selectedType}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        responseType: 'arraybuffer',
      });

      // Handle download success
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Berhasil!',
        text2: 'Laporan berhasil diunduh',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      Toast.show({
        type: 'error',
        text1: 'Gagal!',
        text2: 'Tidak dapat mengunduh laporan',
      });
    }
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
            Multi Payment
          </Text>
        </View>
        <View className="bg-green-600 rounded-full">
          <MaterialCommunityIcons
            name="credit-card-multiple"
            size={18}
            color={"white"}
            style={{ padding: 5 }}
          />
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row space-x-5 mb-3 ">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <PickerButton
              label="Tahun"
              value={selectedYear}
            />
          </MenuView>

          <MenuView
            title="Pilih Bulan"
            onPressAction={handleMonthChange}
            actions={months.map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <PickerButton
              label="Bulan"
              value={months.find(m => m.id === selectedMonth)?.title}
            />
          </MenuView>
        </View>

        <MenuView
          title="Pilih Metode"
          onPressAction={handleTypeChange}
          actions={types.map(option => ({
            id: option.id,
            title: option.title,
          }))}>
          <PickerButton
            label="Metode"
            value={types.find(t => t.id === selectedType)?.title}
            style={{ width: '100%' }}
          />
        </MenuView>

        <TouchableOpacity
          onPress={() => navigation.navigate("FormMulti")}
          className="bg-[#312e81] px-14 py-1.5 rounded-md flex-row items-center mt-3 mb-3 justify-center"
          style={{ height: 49 }}
        >
          <MaterialIcons name="add" size={20} color="white" style={{ marginRight: 7 }} />
          <Text className="text-white font-poppins-medium text-base">
            Buat
          </Text>
        </TouchableOpacity>
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
              <FontAwesome5 size={40} color="#177a44" name="file-pdf" />
            </View>

            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Konfirmasi Download
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
              Apakah Anda yakin ingin Mengunduh Report?
            </Text>

            <View className="flex-row w-full justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 mr-3 bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-poppins-medium">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={downloadReport}
                className="flex-1 ml-3 bg-green-500 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-poppins-medium">Ya, Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/pembayaran/multi-payment"
          payload={{
            type: selectedType,
            tahun: selectedYear,
            bulan: selectedMonth,
            page: 1,
            per: 10,
          }}
          renderItem={renderItem}
          className="px-4 mb-4"
        />
        <View className="mb-5 mt-12">
          <TextFooter ></TextFooter>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleReport}
        className="absolute right-4 bg-red-400 px-4 py-3 rounded-full flex-row items-center"
        style={{
          position: 'absolute',
          bottom: 35,
          right: 20,
          backgroundColor: '#dc2626',
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
        <FontAwesome5 name="file-pdf" size={19} color="white" />

        <TTEModal
          visible={tteModalVisible}
          onClose={() => setTteModalVisible(false)}
          onSubmit={handleTTESubmit}
          type={tteType}
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
                  className="p-2 rounded flex-row items-center">
                  <Feather name="download" size={21} color="black" />
                </TouchableOpacity>
              </View>

              {!pdfLoaded && !pdfError && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ececec" }}>
                  <ActivityIndicator size="large" color="#312e81" style={{ top: 180 }} />
                  <Text className="mt-2 text-black font-poppins-medium" style={{ top: 175 }}>Memuat PDF...</Text>
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

      </TouchableOpacity>
    </View>
  );
};

export default MultiPayment;