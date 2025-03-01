import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import HorizontalFilterMenu from "@/src/screens/components/HorizontalFilterMenu";
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS, { downloadFile } from 'react-native-fs';
import Toast from 'react-native-toast-message';
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { useHeaderStore } from '@/src/screens/main/Index';
import { TextFooter } from "@/src/screens/components/TextFooter";


const currentYear = new Date().getFullYear()
const generateYears = () => {
  let years = []
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) })
  }
  return years
}
const pengambilOptions = [
  { id: 0, name: "Menunggu Konfirmasi" },
  { id: 1, name: "Telah Konfirmasi" },
];

const PengambilSampel = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedPengambil, setSelectedPengambil] = useState(0);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const isConfirmed = selectedPengambil === 1; // Telah Diambil
  const { setHeader } = useHeaderStore();
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [currentReportType, setCurrentReportType] = useState('');
  
    useEffect(() => {
      if (modalVisible) {
        setPdfLoaded(false);
        setPdfError(false);
      }
    }, [modalVisible]);

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({

    onSuccess: () => {
      queryClient.invalidateQueries(['pengambil-sample']);
      paginateRef.current?.refetch()
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const dropdownOptions1 = [
    { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailPengambilSample", { uuid: item.uuid, status: item.status }) }
  ]

  const dropdownOptions = [

    { id: "Detail", title: "Detail", action: item => navigation.navigate("DetailPengambilSample", { uuid: item.uuid, status: item.status }) },
    { id: "Cetak Sampling", title: "Cetak Sampling", action: item => handlePreviewPS({ uuid: item.uuid }) },
    {
      id: "Berita Acara",
      title: "Berita Acara",
      subactions: [
        {
          id: "Berita Acara Pengambilan",
          title: "Berita Acara Pengambilan",
          action: item => BeritaAcara({ uuid: item.uuid })
        },
        {
          id: "Data Pengambilan",
          title: "Data Pengambilan",
          action: item => DataPengambilan({ uuid: item.uuid })
        }
      ]
    }
  ];

  const BeritaAcara = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/berita-acara?token=${authToken}`);
    setModalVisible(true);
    setCurrentReportType('berita-acara');
  }
  const handlePreviewPS = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/sampling?token=${authToken}`);
    setModalVisible(true);
    setCurrentReportType('sampling');
  }
  const DataPengambilan = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/data-pengambilan?token=${authToken}`);
    setModalVisible(true);
    setCurrentReportType('data-pengambilan');
  }

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      let fileName;
      switch (currentReportType) {
        case 'berita-acara':
          fileName = `Berita_Acara_${Date.now()}.pdf`;
          break;
        case 'sampling':
          fileName = `Cetak_Sampling_${Date.now()}.pdf`;
          break;
        case 'data-pengambilan':
          fileName = `Data_Pengambilan_${Date.now()}.pdf`;
          break;
          default:
          break;
      }

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

      // Show toast message for error
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };


  const renderItem = ({ item }) => {
    const isDiterima = item.kesimpulan_permohonan;


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
                <Text className="text-xs text-gray-500 font-poppins-regular">Kode</Text>
                <Text className="text-md text-black font-poppins-semibold mb-3">
                  {item.kode}
                </Text>
                <Text className="text-xs text-gray-500 font-poppins-regular">Pelanggan</Text>
                <Text className="text-md text-black font-poppins-semibold mb-3">
                  {item.permohonan.user.nama}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-xs text-gray-500 font-poppins-regular">Pelanggan</Text>
                <Text className="text-md font-poppins-semibold text-black mb-3">
                  {item.permohonan.industri}
                </Text>
              </>
            )}
            <Text className="text-xs text-gray-500 font-poppins-regular">Titik/Uji Lokasi</Text>
            <Text className="text-md font-poppins-semibold mb-3 text-black">{item.lokasi}</Text>

            <Text className="text-xs text-gray-500 font-poppins-regular">Detail Pengambilan</Text>
            <Text className="text-md font-poppins-semibold text-black"><Text className="text-sm text-black font-poppins-medium">Diambil Pada: </Text>{item.tanggal_pengambilan}</Text>
            <Text className="text-md font-poppins-semibold text-black"><Text className="text-sm text-black font-poppins-medium">Oleh: </Text>{item.pengambil?.nama}</Text>

          </View>
          <View className="absolute right-1 flex-col items-center">
            <Text className={`text-[12px] font-poppins-semibold px-2 py-1 rounded-md mb-3
              ${item.kesimpulan_permohonan == 1 ? 'bg-green-100 text-green-500'
                : item.kesimpulan_permohonan == 2 ? 'bg-red-50 text-red-500'
                  : 'bg-indigo-100 text-indigo-500'}`}>
              {item.kesimpulan_permohonan == 1 ? 'Diterima'
                : item.kesimpulan_permohonan == 2 ? 'Ditolak'
                  : 'Menunggu'}
            </Text>
          </View>
        </View>
        <View className="h-[1px] bg-gray-300 my-3" />
        <View className="flex-row justify-end items-center space-x-2 mr-[-10px]">
          <TouchableOpacity
            onPress={() => navigation.navigate("DetailPengambilSample", { uuid: item.uuid })}
            className="bg-indigo-500 px-3 py-2 rounded-md"
          >
            <View className="flex-row">
              <Ionicons name="eye-outline" size={15} color="white" style={{ marginRight: 5 }} />
              <Text className="text-white font-poppins-medium text-[11px]">Detail</Text>
            </View>
          </TouchableOpacity>

          {isConfirmed && (
            <TouchableOpacity
              onPress={() => handlePreviewPS({ uuid: item.uuid })}
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
                <Text className="text-red-500 font-poppins-medium text-[11px] mr-2">Berita Acara</Text>
                <Feather name="chevron-down" size={14} color="#ef4444" />
              </TouchableOpacity>
            </MenuView>
          )}
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
          <Text className="text-[20px] font-poppins-medium text-black ml-4">Pengambil Sampel</Text>
        </View>
        <View className="bg-indigo-600 rounded-full">
          <Ionicons
            name="people"
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
                setSelectedYear(selectedOption.title)
                // console.log(selectedOption.title)
              }
            }}
            shouldOpenOnLongPress={false}

          >
            <View>
              <MaterialCommunityIcons name="filter-menu-outline" size={24} color="white" style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }} />
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
        className ="bottom-2"
      />
      <View className="mt-12 mb-8">
        <TextFooter/>
      </View>
      </ScrollView>


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
    </View>
  );
};

export default PengambilSampel; 