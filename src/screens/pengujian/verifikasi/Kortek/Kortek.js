import { useDelete } from "@/src/hooks/useDelete";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import HorizontalFilterMenu from "@/src/screens/components/HorizontalFilterMenu";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Alert } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};
const kortekOptions = [
  { id: 5, name: "Menunggu Konfirmasi" },
  { id: 6, name: "Telah Dikonfirmasi" },
];

const Kortek = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedKortek, setSelectedKortek] = useState(5);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const isConfirmed = Kortek === 9; // Telah Diambil

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["kortek"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const dropdownOptions1 = [
    {
      id: "Hasil Uji",
      title: "Hasil Uji",
      action: item =>
        navigation.navigate("HasilUjis", {
          uuid: item.uuid,
          status: item.status,
        }),
    },
  ];

  const dropdownOptions = [
    // {
    //   id: "Edit",
    //   title: "Edit",
    //   action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    // },
    // { id: "Hapus", title: "Hapus", action: item => deleteMetode(`/master/acuan-metode/${item.uuid}`) },
    {
      id: "Hasil Uji",
      title: "Hasil Uji",
      action: item =>
        navigation.navigate("HasilUjis", {
          uuid: item.uuid,
          status: item.status,
        }),
    },
    {
      id: "RDPS",
      title: "RDPS",
      action: item => handlePreviewRDPS({ uuid: item.uuid }),
    },
    {
      id: "Preview LHU",
      title: "Preview LHU",
      action: item => handlePreviewLhu({ uuid: item.uuid }),
    },
  ];

  const handlePreviewLhu = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`,
    );
    setModalVisible(true);
  };
  const handlePreviewRDPS = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/rdps?token=${authToken}`,
    );
    setModalVisible(true);
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

  const renderItem = ({ item }) => {
    const isMenungguKonfirmasi = selectedKortek === 5;

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
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

            <Text className="text-xs font-poppins-regular text-gray-500">Peraturan</Text>
            <Text className="text-md font-poppins-semibold text-black mb-2">
              {item.peraturan?.nama}
            </Text>
          </View>

          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md py-1 px-2 max-w-[120px] mb-2">
              <Text
                className="text-[11px] text-indigo-600 font-poppins-semibold text-right"
                numberOfLines={3}
                ellipsizeMode="tail">
                {item.text_status}
              </Text>
            </View>
          </View>
        </View>

        <View className="h-[1px] bg-gray-300 my-3" />

        <View className="flex-row justify-end mt-1 space-x-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("HasilUjis", {
              uuid: item.uuid,
              status: item.status,
            })}
            className="bg-indigo-500 px-3 py-2 rounded-md flex-row items-center mr-1">
            <FontAwesome6Icon name="vial" size={13} color="white" />
            <Text className="text-white text-xs ml-1 font-poppins-medium">
              Hasil Uji
            </Text>
          </TouchableOpacity>

          {!isMenungguKonfirmasi && (
            <>
              <TouchableOpacity
                onPress={() => handlePreviewRDPS({ uuid: item.uuid })}
                className="bg-red-500 px-3 py-2 rounded-md flex-row items-center mr-1">
                <FontAwesome5Icon name="file-pdf" size={16} color="white" />
                <Text className="text-white text-xs ml-1 font-poppins-medium">
                  RDPS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handlePreviewLhu({ uuid: item.uuid })}
                className="bg-red-100 px-3 py-2 rounded-md flex-row items-center">
                <FontAwesome5Icon name="file-pdf" size={16} color="#ef4444" />
                <Text className="text-red-500 text-xs ml-1 font-poppins-medium">
                  Preview LHU
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };
  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className=" p-3">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-5">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-poppins-semibold text-black">
                  Koordinator Teknis
                </Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View style={{ flex: 1, marginVertical: 8 }}>
                <HorizontalFilterMenu
                  items={kortekOptions}
                  selected={selectedKortek}
                  onPress={(item) => setSelectedKortek(item.id)}
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
                    // console.log(selectedOption.title)
                  }
                }}
                shouldOpenOnLongPress={false}>
                <View style={{ marginEnd: 5 }}>
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
          </View>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/verifikasi/koordinator-teknis"
        payload={{
          status: selectedKortek,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="mb-12"
      />

      <DeleteConfirmationModal />
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
    </View>
  );
};

export default Kortek;