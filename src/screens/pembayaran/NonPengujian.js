import React, { useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import { rupiah } from "@/src/libs/utils";
import { useDelete } from '@/src/hooks/useDelete';
import { useQueryClient } from "@tanstack/react-query";
import Pdf from 'react-native-pdf';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { TextFooter } from "../components/TextFooter";

const rem = multiplier => 16 * multiplier;

const NonPengujian = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState("-");
  const [type, setType] = useState("va");

  const [reportUrl, setReportUrl] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const { delete: deleteNonPengujian, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['/pembayaran/non-pengujian']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
      // Optionally add error handling toast or alert
    }
  });

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
    { id: "va", text: "Virtual Account" },
    { id: "qris", text: "QRIS" },
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

      const baseUrl = `/api/v1/report/pembayaran/non-pengujian`;
      const reportUrl = `${APP_URL}${baseUrl}?tahun=${tahun}&type=${type}&token=${authToken}`;

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

  const handleDownloadReport = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Pembayaran Non Pengujian-${Date.now()}.pdf`;

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

  const cardNonPengujian = ({ item }) => {
    const getStatusStyle = (status) => {
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
            text: "text-red-700",
            background: "bg-red-100",
            border: "border-red-200",
          };
      }
    };

    const getStatusText = (item) => {
      if (item.is_expired) {
        return "Kedaluwarsa";
      } else {
        const status = item.status;
        switch (status) {
          case "pending":
            return "pending";
          case "success":
            return "success";
          default:
            return "failed";
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

    const statusStyle = getStatusStyle(item.status || 'failed');
    const statusText = getStatusText(item);
    const metodeStyle = getMetodeStyle(item.type);

    return (
      <View
        className="my-3 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-6"
        style={{
          elevation: 4,
        }}>
        <View className="absolute top-[2px] right-1.5 p-2">
          <View className={`rounded-md px-2 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
            <Text
              className={`text-[11px] font-bold text-right ${statusStyle.text}`}
              numberOfLines={2}
              ellipsizeMode="tail">
              {statusText}
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="flex-row justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Nama</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.nama}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Metode</Text>
              <View className={`rounded-md px-2 py-1.5 border self-start ${metodeStyle.background} ${metodeStyle.border}`}>
                <Text
                  className={`text-[11px] font-bold ${metodeStyle.text}`}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {(item.type || '').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Jumlah Nominal</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {rupiah(item.jumlah || 0)}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Tanggal Kedaluwarsa</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.tanggal_exp_indo || '-'}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-300 my-2" />

          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={() => navigation.navigate('DetailNonPengujian', { uuid: item.uuid })}
              className="bg-indigo-500 px-3 py-2.5 rounded-md flex-row items-center">
              <Ionicons name="eye-outline" size={15} color="white" />
              <Text className="text-white text-xs ml-2 font-poppins-medium">
                Detail
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteNonPengujian(`/pembayaran/non-pengujian/${item.uuid}`)}
              className="bg-red-600 px-3 py-2.5 rounded-md flex-row items-center">
              <Ionicons name="ban-outline" size={15} color="white" />
              <Text className="text-white text-xs ml-2 font-poppins-medium">
                Batal
              </Text>
            </TouchableOpacity>
          </View>
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
            <Text className="text-[20px] font-poppins-semibold text-black mx-auto self-center">
              Non Pengujian
            </Text>
          </View>
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

          <TouchableOpacity
            onPress={() => navigation.navigate("FormNonPengujian")}
            className="bg-[#312e81] px-14 py-1.5 rounded-md flex-row items-center ml-2"
            style={{ height: 49.5, marginTop: 10.8, bottom: 10 }}
          >
            <Ionicons name="add" size={20} color="white" style={{ right: 6 }} />
            <Text className="text-white ml-2 font-poppins-medium right-2">
              Buat
            </Text>
          </TouchableOpacity>
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
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-bold text-black">Preview PDF </Text>
              <TouchableOpacity
                onPress={() => {
                  handleDownloadReport();
                  setModalVisible(false);
                }}
                className="p-2 rounded flex-row items-center"
              >
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1, width: '100%', height: '100%' }}
              trustAllCerts={false}
              onError={(error) => {
                console.log('PDF Load Error:', error);
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Gagal memuat PDF",
                });
              }}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-[#dc3546] p-2 rounded flex-1 ml-2"
              >
                <Text className="text-white font-bold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <Paginate
          ref={paginateRef}
          url="/pembayaran/non-pengujian"
          payload={{
            tahun: tahun,
            bulan: bulan,
            type: type,
            page: 1,
            per: 10,
          }}
          renderItem={cardNonPengujian}
          className="px-4 mb-12"
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
          bottom: 75,
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
      </TouchableOpacity>


      <DeleteConfirmationModal />
    </View>
  );
};

export default NonPengujian;