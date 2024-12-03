import React, { useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
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

const Pengujian = ({ navigation }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(2024);
  const [bulan, setBulan] = useState('-');
  const [type, setType] = useState('va');
  const [modalVisible, setModalVisible] = useState(false);
  const [tteModalVisible, setTTEModalVisible] = useState(false);
  const [kwitansiModalVisible, setKwitansiModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

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
    setTahun(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleBulanChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setBulan(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

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
      const baseUrl = `/report/pembayaran/pengujian`;
      const downloadUrl = `${APP_URL}${baseUrl}?tahun=${tahun}&bulan=${bulan}&type=${type}&token=${authToken}`;

      const fileName = `Laporan_Pengujian_${tahun}_${bulan || 'Semua_Bulan'}.pdf`;
      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

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
          text2: `Laporan PDF Berhasil Diunduh. ${Platform.OS === "ios"
            ? "You can find it in the Files app."
            : `Disimpan sebagai ${fileName} di folder Download.`
            }`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download Report error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Laporan PDF gagal diunduh: ${error.message}`,
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
                      {item.payment?.type.toUpperCase() || "-"}
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
                setTTEModalVisible(true);x
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
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <BackButton action={() => navigation.goBack()} size={26} />
            <Text className="text-[20px] font-poppins-semibold text-black mx-auto left-10">
              Pengujian
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePreviewReport}
            className="bg-red-50 px-4 py-3 rounded-md flex-row items-center"
          >
            <FontAwesome5 name="file-excel" size={13} color="#ef4444" />
            <Text className="text-red-500 ml-2 font-poppins-medium text-xs">
              Laporan
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row ml-2">
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
                value={tahun}
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
          <View style={{ marginStart: 8, width: 250, marginTop: 10 }}>
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
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-bold text-black">Preview PDF</Text>
              <TouchableOpacity
                onPress={() => {
                  handleDownloadReport();
                  setModalVisible(false);
                }}
                className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1, width: '100%', height: '100%' }}
              trustAllCerts={false}
              onError={(error) => {
                console.log('PDF Load Error:', error);
              }}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-bold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
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
        className="px-4 mb-12"
      />
    </View>
  );
};

export default Pengujian;