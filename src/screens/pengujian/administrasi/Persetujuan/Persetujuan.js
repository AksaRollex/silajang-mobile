import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState } from "react";
import { Text, View, Modal, TouchableOpacity, Alert, ScrollView } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import HorizontalFilterMenu from '@/src/screens/components/HorizontalFilterMenu';
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS, { downloadFile } from 'react-native-fs';
import Toast from 'react-native-toast-message';
import { useHeaderStore } from '@/src/screens/main/Index';
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { TextFooter } from "@/src/screens/components/TextFooter";

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const pengambilOptions = [
  { id: 0, name: "Menunggu Konfirmasi" },
  { id: 1, name: "Telah Diambil" },
];


const Persetujuan = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedPengambil, setSelectedPengambil] = useState(0);
  const paginateRef = useRef();
  const queryClient = useQueryClient();
  const [selectedCetak, setSelectedCetak] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['pengambil-sample']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const CetakSampling = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/sampling?token=${authToken}`);
    setModalVisible(true);
  };

  const BeritaAcara = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/berita-acara?token=${authToken}`);
    setModalVisible(true);
  };

  const DataPengambilan = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/data-pengambilan?token=${authToken}`);
    setModalVisible(true);
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
          type: 'success',
          text1: 'Success',
          text2: `PDF Berhasil Diunduh. ${Platform.OS === 'ios' ? 'You can find it in the Files app.' : `Saved as ${fileName} in your Downloads folder.`}`,
        });

      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);

      // Show toast message for erropr
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };


  const renderItem = ({ item }) => {
    const isConfirmed = selectedPengambil === 1;

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-2 relative">
          <View className="flex-shrink mr-20">
            {isConfirmed ? (
              <>
                <Text className="font-poppins-regular text-xs text-gray-500">Kode</Text>
                <Text className="text-md font-poppins-semibold mb-3 text-black">
                  {item.kode}
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-regular">Pelanggan</Text>
                <Text className="text-md font-poppins-semibold text-black mb-3">
                  {item.permohonan.user.nama}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-xs text-gray-500 font-poppins-regular">Pelanggan</Text>
                <Text className="text-md font-poppins-semibold mb-3 text-black">
                  {item.permohonan.industri}
                </Text>
              </>

            )}
            <Text className="text-xs text-gray-500 font-poppins-regular">TItik Uji/Lokasi</Text>
            <Text className="text-md mb-3 font-poppins-semibold text-black">{item.lokasi}</Text>


            <Text className="text-xs text-gray-500 font-poppins-regular">Detail Pengambilan</Text>
            <Text className="text-md font-poppins-semibold text-black">Diambil Pada: {item.tanggal_pengambilan}</Text>
            <Text className="text-md font-poppins-semibold text-black">Oleh: {item.pengambil?.nama}</Text>
          </View>
          <View className="absolute right-0 flex-col items-center">
            {!isConfirmed && (
              <Text className={`text-[12px] font-poppins-semibold px-2 py-1 rounded-md mb-3
            ${item.kesimpulan_permohonan == 1 ? 'bg-green-100 text-green-500'
                  : item.kesimpulan_permohonan == 2 ? 'bg-red-50 text-red-500'
                    : 'bg-indigo-100 text-indigo-500'}`}>
                {item.kesimpulan_permohonan == 1 ? 'Diterima'
                  : item.kesimpulan_permohonan == 2 ? 'Ditolak'
                    : 'Menunggu'}
              </Text>
            )}
          </View>
        </View>
        <View className="h-[1px] bg-gray-300 my-3" />
        <View className="w-full px-2">
          <View className="flex-row justify-end items-center space-x-2 mr-[-17px]">
            <TouchableOpacity
              onPress={() => navigation.navigate("DetailPersetujuan", { uuid: item.uuid })}
              className="bg-indigo-500 px-3 py-2 rounded-md"
            >
              <View className="flex-row">
                <Ionicons name="eye-outline" size={15} color="white" style={{ marginRight: 5 }} />
                <Text className="text-white font-poppins-medium text-[11px]">Detail</Text>
              </View>
            </TouchableOpacity>

            {isConfirmed && (
              <TouchableOpacity
                onPress={() => CetakSampling({ uuid: item.uuid })}
                className="bg-red-600 px-3 py-2 rounded-md"
              >
                <View className="flex-row">
                  <FontAwesome5 name="file-pdf" size={15} color="white" style={{ marginRight: 5 }} />
                  <Text className="text-white font-poppins-medium text-[11px]">Cetak Sampling</Text>
                </View>
              </TouchableOpacity>
            )}
            {isConfirmed && (
              <MenuView
                title="Berita Acara"
                actions={[
                  {
                    id: "Berita Acara Pengambilan",
                    title: "Berita Acara Pengambilan",
                    action: () => BeritaAcara({ uuid: item.uuid }),
                  },
                  {
                    id: "Data Pengambilan",
                    title: "Data Pengambilan",
                    action: () => DataPengambilan({ uuid: item.uuid }),
                  },
                ]}
                onPressAction={({ nativeEvent }) => {
                  const selectedOption = nativeEvent.event;
                  if (selectedOption === "Berita Acara Pengambilan") {
                    BeritaAcara({ uuid: item.uuid });
                  } else if (selectedOption === "Data Pengambilan") {
                    DataPengambilan({ uuid: item.uuid });
                  }
                }}
              >
                <TouchableOpacity className="bg-red-100 px-3 py-2 rounded-md flex-row items-center">
                  <Text className="text-red-500 font-poppins-semibold text-[11px] mr-2">Berita Acara</Text>
                  <Feather name="chevron-down" size={14} color="#ef4444" />
                </TouchableOpacity>
              </MenuView>
            )}
          </View>
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
          <Text className="text-[20px] font-poppins-medium text-black ml-4">Persetujuan</Text>
        </View>
        <View className="bg-green-600 rounded-full">
          <Ionicons
            name="checkmark-done"
            size={18}
            color={'white'}
            style={{ padding: 5 }}
          />
        </View>
      </View>

    <View className="p-4">    
      <View className="flex-row justify-center">
        <View style={{ flex: 1, marginVertical: 8 }}>
          <HorizontalFilterMenu
            items={pengambilOptions}
            selected={selectedPengambil}
            onPress={(item) => setSelectedPengambil(item.id)}
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
          <View>
            <MaterialCommunityIcons
              name="filter-menu-outline"
              size={24}
              color="white"
              style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }}
            />
          </View>
        </MenuView>
      </View>
    </View>

    <ScrollView>
      <Paginate
        ref={paginateRef}
        url="/administrasi/pengambil-sample"
        payload={{
          status: selectedPengambil,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="bottom-2"
      />
      <View className="mt-12 mb-8">
                        <TextFooter />
                      </View>
    </ScrollView>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-2xl w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">Preview Pdf</Text>
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
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DeleteConfirmationModal />
    </View >
  );
};

export default Persetujuan;
