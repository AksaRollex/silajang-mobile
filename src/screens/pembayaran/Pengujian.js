import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { rupiah } from "@/src/libs/utils";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TTEModal from './TTEModal';
import KwitansiModal from "./KwitansiModal";
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { useHeaderStore } from "../main/Index";
import { TextFooter } from "../components/TextFooter";

const Pengujian = ({ navigation, onSelectYearMonth }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();

  const getCurrentYear = () => new Date().getFullYear();
  const getCurrentMonth = () => new Date().getMonth() + 1;

  const [tahun, setTahun] = useState(getCurrentYear());
  const [bulan, setBulan] = useState(getCurrentMonth());

  const [type, setType] = useState('va');
  const [modalVisible, setModalVisible] = useState(false);
  const [tteModalVisible, setTTEModalVisible] = useState(false);
  const [kwitansiModalVisible, setKwitansiModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [pdfError, setPdfError] = useState(false);
    const [pdfLoaded, setPdfLoaded] = useState(false);
  
    useEffect(() => {
      if (modalVisible) {
        setPdfLoaded(false);
        setPdfError(false);
      }
    }, [modalVisible]);

   const { setHeader } = useHeaderStore();
            
          React.useLayoutEffect(() => {
            setHeader(false)
        
            return () => setHeader(true)
          }, [])

  const tahuns = useMemo(() => {
    const currentYear = getCurrentYear();
    return Array.from(
      { length: currentYear - 2021 },
      (_, i) => ({
        id: 2022 + i,
        text: `${2022 + i}`,
      })
    );
  }, []);

  const bulans = [
    { id: 1, text: "Januari" },
    { id: 2, text: "Februari" },
    { id: 3, text: "Maret" },
    { id: 4, text: "April" },
    { id: 5, text: "Mei" },
    { id: 6, text: "Juni" },
    { id: 7, text: "Juli" },
    { id: 8, text: "Agustus" },
    { id: 9, text: "September" },
    { id: 10, text: "Oktober" },
    { id: 11, text: "November" },
    { id: 12, text: "Desember" },
  ];

  const metodes = [
    { id: 'va', text: "Virtual Account" },
    { id: 'qris', text: "QRIS" },
  ];

  const handleYearChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    const selectedYear = parseInt(selectedId);
    setTahun(selectedYear);

    if (selectedYear === getCurrentYear()) {
      setBulan(getCurrentMonth());
    }

     // Cek apakah onSelectYearMonth didefinisikan sebelum dipanggil
     if (typeof onSelectYearMonth === "function") {
      onSelectYearMonth(selectedYear, bulan);
    }
  }, [onSelectYearMonth, bulan]);

  const handleBulanChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    const selectedMonth = parseInt(selectedId);
    setBulan(selectedMonth);

    // Cek apakah onSelectYearMonth didefinisikan sebelum dipanggil
    if (typeof onSelectYearMonth === "function") {
      onSelectYearMonth(tahun, selectedMonth);
    }
  }, [onSelectYearMonth, tahun]);

  const handleMetodeChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setType(selectedId);
    paginateRef.current?.refetch();
  }, []);

  const handlePreviewReport = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const baseUrl = `/api/v1/report/pembayaran/pengujian`;
      const reportUrl = `${APP_URL}${baseUrl}?tahun=${tahun}&bulan=${bulan}&type=${type}&token=${authToken}`;

      setReportUrl(reportUrl);
      setModalVisible(true);
    } catch (error) {
      console.error("Preview Report error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal memuat laporan",
      });
    }
  };

  const handlePreviewSKRDPDF = async (uuid) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${uuid}/skrd?token=${authToken}`);
    setModalVisible(true);
  };


  const handlePreviewKwitansiPDF = async (uuid) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${uuid}/kwitansi?token=${authToken}`);
    setModalVisible(true);
  };

  const handleDownloadReport = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Pembayaran Pengujian-${Date.now()}.pdf`;

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
        // Show toast message for success
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `PDF Berhasil Diunduh. ${Platform.OS === "ios"
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

  const PickerButton = ({ label, value, style }) => (
    <View
      style={[{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        width: 187,
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

  const getStatusStyle = (item) => {
    // console.log('item: ', item.payment_type)
    if (item.payment?.is_expired) {
      return {
        text: "text-red-700",
        background: "bg-red-100",
        border: "border-red-100",
      };
    } else {
      const status = item.payment?.status;
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
        default:
          return {
            text: "text-gray-700",
            background: "bg-gray-100",
            border: "border-gray-200",
          };
      }
    }
  };

  const getStatusText = (item) => {
    if (item.payment?.is_expired) {
      return "Kedaluwarsa";
    } else {
      const status = item.payment?.status;
      switch (status) {
        case "pending":
          return "Belum Dibayar";
        case "success":
          return "Berhasil";
        default:
          return "Gagal";
      }
    }
  };

  const getMetodeStyle = (metode) => {
    switch (metode) {
      case 'va':
        return {
          text: "text-green-600",
          background: "bg-green-100",
          border: "border-green-100",
        };
      default:
        return {
          text: "text-blue-700",
          background: "bg-blue-50",
          border: "border-blue-50",
        };
    }
  };

  const handleTTESubmit = (formData) => {
    // Handle TTE submit
    console.log('TTE Form Data:', formData);
    console.log('Selected Item:', selectedItem);
    setTTEModalVisible(false);
  };
  const handleKwitansiSubmit = (formData) => {
    // Handle TTE submit
    console.log('TTE Form Data:', formData);
    console.log('Selected Item:', selectedItem);
    setKwitansiModalVisible(false);
  };

  const cardPengujian = ({ item }) => {
    const statusStyle = getStatusStyle(item);
    const statusText = getStatusText(item);
    const metodeStyle = getMetodeStyle(item.payment?.type);

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between">
          <View className="absolute top-0 right-0 p-2">
            <View className={`rounded-md px-1.5 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
              <Text
                className={`text-[11px] font-bold text-right ${statusStyle.text}`}
                numberOfLines={2}
                ellipsizeMode="tail">
                {statusText}
              </Text>
            </View>
          </View>

          <View className="flex-1 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
            <Text className="text-md font-poppins-semibold text-black mb-4">
              {item.kode}
            </Text>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-5">
                <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item?.permohonan?.user?.nama || "-"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Lokasi</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.lokasi}
                </Text>
              </View>
            </View>

            <View className="flex-row pr-3">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-poppins-regular text-gray-500">Harga</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {rupiah(item.harga)}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center">
                <View>
                  <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Bayar</Text>
                  <Text className="text-md font-poppins-semibold text-black">
                    {item.payment?.tanggal_bayar || "-"}
                  </Text>
                </View>
                <View className="ml-5">
                  <Text className="text-xs font-poppins-regular text-gray-500">Metode</Text>
                  <View className={`rounded-md px-1.5 py-1 border ${metodeStyle.background} ${metodeStyle.border}`}>
                    <Text
                      className={`text-[11px] font-bold text-center ${metodeStyle.text}`}
                      numberOfLines={2}
                      ellipsizeMode="tail">
                      {item.payment_type?.toUpperCase() || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="h-[1px] bg-gray-300 my-3" />

        <View className="flex-row justify-end mt-1 space-x-2">
          <View className="flex-row space-x-2">
            <TouchableOpacity
              onPress={() => navigation.navigate('Detail', { uuid: item.uuid })}
              className="bg-blue-500 px-3 py-2 rounded-md flex-row items-center">
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
                  setTTEModalVisible(true); x
                }
              }}
            >
              <TouchableOpacity
                className="bg-[#312e81] px-3 py-2 rounded-md flex-row items-center"
              >
                <FontAwesome5 name="file-signature" size={13} color="white" />
                <Text className="text-white text-xs ml-1 font-poppins-medium">
                  TTE SKRD
                </Text>
                <MaterialIcons name="arrow-drop-down" size={16} color="white" />
              </TouchableOpacity>
            </MenuView>

            {item.payment?.is_lunas == 1 && (
              <MenuView
                title="TTE Kwitansi"
                actions={[
                  { id: 'apply', title: 'Ajukan TTE' }
                ]}
                onPressAction={({ nativeEvent }) => {
                  if (nativeEvent.event === 'apply') {
                    setSelectedItem(item);
                    setKwitansiModalVisible(true);
                  }
                }}
              >
                <TouchableOpacity className="bg-yellow-500 px-3 py-2 rounded-md flex-row items-center">
                  <FontAwesome5 name="file-signature" size={13} color="white" />
                  <Text className="text-white text-xs ml-1 font-poppins-medium">
                    TTE Kwitansi
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={16} color="white" />
                </TouchableOpacity>
              </MenuView>
            )}
          </View>

          {item.payment && item.text_status_pembayaran === 'Belum Dibayar' && (
            <TouchableOpacity
              onPress={() => {
                console.log("Send WhatsApp for", item.uuid);
              }}
              className="bg-green-700 px-3 py-2 rounded-md flex-row items-center">
              <FontAwesome5 name="whatsapp" size={13} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row justify-end mt-2">
          <MenuView
            title="PDF"
            actions={[
              { id: 'skrd', title: 'SKRD' },
              { id: 'kwitansi', title: 'Kwitansi' }
            ]}
            onPressAction={({ nativeEvent }) => {
              if (nativeEvent.event === 'skrd') {
                handlePreviewSKRDPDF(item.uuid);
              } else if (nativeEvent.event === 'kwitansi') {
                handlePreviewKwitansiPDF(item.uuid);
              }
            }}
          >
            <TouchableOpacity className="bg-red-600 px-3 py-2 rounded-md flex-row items-center">
              <FontAwesome5 name="file-pdf" size={13} color="white" />
              <Text className="text-white text-xs ml-1 font-poppins-medium">
                PDF
              </Text>
              <MaterialIcons name="arrow-drop-down" size={16} color="white" />
            </TouchableOpacity>
          </MenuView>
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
             <Text className="text-[20px] font-poppins-medium text-black ml-4">Pengujian</Text>
           </View>
           <View className="bg-green-600 rounded-full">
             <Ionicons
               name="wallet"
               size={18}
               color={'white'}
               style={{ padding: 5 }}
             />
           </View>
         </View>

      <View className="p-6">
        <View className="flex-row">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={tahuns.map(option => ({
              id: option.id.toString(),
              title: option.text,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <PickerButton
                label="Tahun"
                value={tahun.toString()}
              />
            </View>
          </MenuView>

          <MenuView
            title="Pilih Bulan"
            onPressAction={handleBulanChange}
            actions={bulans.map(option => ({
              id: option.id.toString(),
              title: option.text,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <PickerButton
                label="Bulan"
                value={bulans.find(b => b.id === bulan)?.text}
              />
            </View>
          </MenuView>
        </View>

        <MenuView
          title="Pilih Metode"
          onPressAction={handleMetodeChange}
          actions={metodes.map(option => ({
            id: option.id,
            title: option.text,
          }))}>
          <View style={{  width: 250, marginTop: 10 }}>
            <PickerButton
              label="Metode"
              value={metodes.find(m => m.id === type)?.text}
              style={{ width: 380 }}
            />
          </View>
        </MenuView>
      </View>

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
                  handleDownloadReport();
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
        onClose={() => setTTEModalVisible(false)}
        onSubmit={handleTTESubmit}
      />

      <KwitansiModal
        visible={kwitansiModalVisible}
        onClose={() => setKwitansiModalVisible(false)}
        onSubmit={handleKwitansiSubmit}
      />
 
      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/pembayaran/pengujian"
          payload={{
            tahun: tahun,
            bulan: bulan,
            type: type,
            page: 1,
            per: 10,
          }}
          renderItem={cardPengujian}
          className="px-4 mb-12 bottom-2"
        />
        <View className="mt-12 mb-8">
          <TextFooter />
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={handlePreviewReport}
        className="absolute bottom-20 right-4 bg-red-500 px-4 py-3 rounded-full flex-row items-center"
        style={{
          position: 'absolute',
          bottom: 15,
          right: 15,
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

      </TouchableOpacity>

    </View>
  );
};

export default Pengujian;